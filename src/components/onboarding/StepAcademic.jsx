import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FIELDS_OF_STUDY } from "@/lib/sectors";

const levels = [
  { value: "high_school", label: "High School / Senior Year" },
  { value: "bachelor_1", label: "Bachelor Year 1" },
  { value: "bachelor_2", label: "Bachelor Year 2" },
  { value: "bachelor_3", label: "Bachelor Year 3" },
  { value: "master_1", label: "Master Year 1" },
  { value: "master_2", label: "Master Year 2" },
  { value: "phd", label: "PhD" },
];

export default function StepAcademic({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Field of study</Label>
        <Select value={data.field_of_study || ""} onValueChange={(v) => onChange({ ...data, field_of_study: v })}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="Choose your field of study" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {FIELDS_OF_STUDY.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Academic level</Label>
        <Select value={data.academic_level || ""} onValueChange={(v) => onChange({ ...data, academic_level: v })}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="Choose your level" />
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