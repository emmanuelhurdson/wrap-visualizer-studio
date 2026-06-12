import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PartSelectorProps {
  parts: Array<{ uuid: string; name: string }>;
  selectedPartUuid: string | null;
  onSelectPart: (uuid: string) => void;
  onRemovePart: (uuid: string) => void;
}

export function PartSelector({
  parts,
  selectedPartUuid,
  onSelectPart,
  onRemovePart,
}: PartSelectorProps) {
  if (parts.length === 0) {
    return (
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-lg">Paintable Parts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No parts selected. Click on the car in "Pick Mode" to add parts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-lg">Paintable Parts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {parts.map((part) => (
            <div
              key={part.uuid}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                selectedPartUuid === part.uuid
                  ? "bg-primary/20 border border-primary"
                  : "bg-card border border-border hover:bg-accent"
              }`}
              onClick={() => onSelectPart(part.uuid)}
            >
              <span className="text-sm font-medium">{part.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePart(part.uuid);
                }}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
