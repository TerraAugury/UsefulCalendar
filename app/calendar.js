import { compareByStartTime } from "./appointments.js";

export function filterByRange(appointments, range) {
  const fromDate = range.from || "";
  const toDate = range.to || "";
  return appointments.filter((appointment) => {
    const matchesFrom = fromDate ? appointment.date >= fromDate : true;
    const matchesTo = toDate ? appointment.date <= toDate : true;
    return matchesFrom && matchesTo;
  });
}

export function groupAppointmentsByDate(appointments) {
  const groups = new Map();
  appointments.forEach((appointment) => {
    if (!groups.has(appointment.date)) {
      groups.set(appointment.date, []);
    }
    groups.get(appointment.date).push(appointment);
  });

  const sortedDates = Array.from(groups.keys()).sort((a, b) =>
    a.localeCompare(b)
  );
  return sortedDates.map((date) => {
    const items = groups.get(date).sort(compareByStartTime);
    return { date, items };
  });
}
