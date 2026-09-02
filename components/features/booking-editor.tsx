"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useEditBooking,
  useUpdateBookingStatus,
} from "@/lib/hooks/use-bookings";
import { useClinicTime } from "@/lib/hooks/use-clinic-zone";
import {
  fromClinicInputValue,
  toClinicInputValue,
} from "@/lib/utils/clinic-time";
import type { Booking } from "@/lib/schemas/bookings";

/** Move, amend or cancel an appointment.
 *
 *  Every change here also changes the practice's own calendar — the backend
 *  moves or cancels it in their software as part of the same request. That is
 *  the whole point: a front desk that has to fix two calendars by hand will fix
 *  one and forget the other, and then the agent offers an hour that is not free.
 */

export function BookingEditor({ booking }: { booking: Booking }) {
  const edit = useEditBooking();
  const status = useUpdateBookingStatus();
  // The box shows and reads the CLINIC's wall clock. It used to use the
  // browser's, so rescheduling a Massachusetts appointment from Israel would
  // have moved a real patient by six hours — silently, and in their own
  // practice software as well.
  const { timeZone, zoneLabel } = useClinicTime();

  const [when, setWhen] = React.useState(() =>
    toClinicInputValue(booking.appointment_at, timeZone)
  );
  const [minutes, setMinutes] = React.useState(
    String(booking.duration_minutes ?? 60)
  );
  const [procedure, setProcedure] = React.useState(booking.procedure_type ?? "");
  const [confirmingCancel, setConfirmingCancel] = React.useState(false);

  // The row can change under us — someone else edits it, or the agent moves it.
  React.useEffect(() => {
    setWhen(toClinicInputValue(booking.appointment_at, timeZone));
    setMinutes(String(booking.duration_minutes ?? 60));
    setProcedure(booking.procedure_type ?? "");
  }, [booking.appointment_at, booking.duration_minutes, booking.procedure_type,
      timeZone]);

  const isCancelled = booking.status === "cancelled";
  const dirty =
    when !== toClinicInputValue(booking.appointment_at, timeZone) ||
    minutes !== String(booking.duration_minutes ?? 60) ||
    procedure !== (booking.procedure_type ?? "");

  const save = () => {
    const data: Record<string, string | number> = {};
    if (when !== toClinicInputValue(booking.appointment_at, timeZone)) {
      // The clinic's wall clock in the box → the instant the API stores.
      data.appointment_at = fromClinicInputValue(when, timeZone);
    }
    if (minutes !== String(booking.duration_minutes ?? 60)) {
      data.duration_minutes = Number(minutes);
    }
    if (procedure !== (booking.procedure_type ?? "")) {
      data.procedure_type = procedure;
    }
    edit.mutate({ id: booking.id, data });
  };

  if (isCancelled) {
    return (
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">
            This appointment is cancelled. Book a new one rather than reviving
            it — the old time was given back to the practice&apos;s calendar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-base">Reschedule or amend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-2">
        <p className="text-xs text-gray-500">
          Saving also updates the practice&apos;s own calendar.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="appointment-at">
              Date &amp; time{zoneLabel() ? ` (${zoneLabel()})` : ""}
            </Label>
            <Input
              id="appointment-at"
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="duration">Minutes</Label>
            <Input
              id="duration"
              type="number"
              min={5}
              max={480}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="procedure">Appointment type</Label>
          <Input
            id="procedure"
            value={procedure}
            placeholder="Cleaning"
            onChange={(e) => setProcedure(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button onClick={save} disabled={!dirty || edit.isPending}>
            {edit.isPending ? "Saving…" : "Save changes"}
          </Button>

          {confirmingCancel ? (
            <>
              <span className="text-sm text-gray-600">
                Cancel this appointment and free the chair?
              </span>
              <Button
                variant="destructive"
                disabled={status.isPending}
                onClick={() =>
                  status.mutate({ id: booking.id, status: "cancelled" })
                }
              >
                {status.isPending ? "Cancelling…" : "Yes, cancel"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setConfirmingCancel(false)}
              >
                Keep it
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="ml-auto"
              onClick={() => setConfirmingCancel(true)}
            >
              Cancel appointment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
