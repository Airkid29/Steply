import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FIELDS_OF_STUDY } from "@/lib/sectors";

const levels = [
  { value: "high_school", label: "Lycée / Terminale" },
  { value: "bachelor_1", label: "Licence 1 (Bac+1)" },
  { value: "bachelor_2", label: "Licence 2 (Bac+2)" },
  { value: "bachelor_3", label: "Licence 3 (Bac+3)" },
  { value: "master_1", label: "Master 1 (Bac+4)" },
  { value: "master_2", label: "Master 2 (Bac+5)" },
  { value: "phd", label: "Doctorat (PhD)" },
];

export default function StepAcademic({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Domaine d'études</Label>
        <Select value={data.field_of_study || ""} onValueChange={(v) => onChange({ ...data, field_of_study: v })}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="Choisissez votre domaine" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {FIELDS_OF_STUDY.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Niveau académique</Label>
        <Select value={data.academic_level || ""} onValueChange={(v) => onChange({ ...data, academic_level: v })}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="Choisissez votre niveau" />
          </SelectTrigger>
          <SelectContent>
            {levels.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}