import { getPersons } from "@/lib/actions/persons";
import { PersonsForm } from "./persons-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Server component — fetches data, passes to client form
export async function PersonsSettings() {
  const persons = await getPersons();

  return (
    <Card>
      <CardHeader>
        <CardTitle>People</CardTitle>
      </CardHeader>
      <CardContent>
        <PersonsForm initialPersons={persons} />
      </CardContent>
    </Card>
  );
}
