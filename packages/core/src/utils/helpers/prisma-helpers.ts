/**
 * Combines multiple Prisma schema contents into a single schema string.
 * Ensures generator and datasource blocks are only included once (from the first occurrence).
 */
export const combinePrismaSchemas = (schemaContents: string[]): string => {
  let combinedSchema = "";
  let hasGenerator = false;
  let hasDatasource = false;

  for (const content of schemaContents) {
    const lines = content.split("\n");
    const filteredLines: string[] = [];
    let inGeneratorBlock = false;
    let inDatasourceBlock = false;
    let skipBlock = false;

    for (const line of lines) {
      if (line.trim().startsWith("generator ")) {
        inGeneratorBlock = true;
        if (!hasGenerator) {
          filteredLines.push(line);
          hasGenerator = true;
          skipBlock = false;
        } else {
          skipBlock = true;
        }
        continue;
      }

      if (line.trim().startsWith("datasource ")) {
        inDatasourceBlock = true;
        if (!hasDatasource) {
          filteredLines.push(line);
          hasDatasource = true;
          skipBlock = false;
        } else {
          skipBlock = true;
        }
        continue;
      }

      // Handle lines within generator/datasource blocks
      if (inGeneratorBlock || inDatasourceBlock) {
        if (!skipBlock) {
          filteredLines.push(line);
        }

        // Detect end of block
        if (line.trim().startsWith("}")) {
          inGeneratorBlock = false;
          inDatasourceBlock = false;
          skipBlock = false;
        }
        continue;
      }

      // Add all other lines (models, enums, etc.)
      filteredLines.push(line);
    }

    combinedSchema += filteredLines.join("\n") + "\n\n";
  }

  return combinedSchema.trim();
};