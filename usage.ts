// usage.ts
import * as fs from 'fs';
import { FigmaDocumentNode } from "./types";
import { isModal } from "./identify";
import { transform } from "./transform";

function main() {
  const jsonRaw = fs.readFileSync("./test_fig_4.json", "utf-8");
  const figmaData: FigmaDocumentNode = JSON.parse(jsonRaw);

  if (isModal(figmaData)) {
    const result = transform(figmaData);

    // Type-safe error checking
    if ("error" in result && result.error instanceof Error) {
      console.error("Transformation failed:", result.error.message);
      return;
    }

    fs.writeFileSync(
      "./nocode_converted.json",
      JSON.stringify(result, null, 2),
      "utf-8"
    );
    console.log("Modal transformation written to nocode_converted.json");
  } else {
    console.log("Node is not a modal.");
  }
}

main();
