import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_COUNTRIES } from "@/lib/countries";

export default function StepPersonal({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="name" className="text-sm font-medium mb-1.5 block">Full name</Label>
        <Input
          id="name"
          placeholder="e.g. Sarah Martin"
          value={data.name || ""}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="h-12 rounded-xl"
        />
      </div>
      <div>
        <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">Email</Label>
        <Input
          id="email"
          type="email"
          value={data.email || ""}
          className="h-12 rounded-xl"
          disabled
        />
        <p className="text-xs text-muted-foreground mt-1">Linked to your account</p>
      </div>
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Country</Label>
        <Select value={data.country || ""} onValueChange={(v) => onChange({ ...data, country: v })}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {ALL_COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}