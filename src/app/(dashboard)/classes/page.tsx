import { getClasses } from "@/app/actions/classes";
import { ClassesClient } from "@/components/classes/classes-client";

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <ClassesClient initialClasses={classes} />
  );
}
