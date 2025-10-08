import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text,
} from "@clack/prompts";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { getDMMF } from "@prisma/internals";
import color from "picocolors";
import path from "node:path";

const outputPath = path.join(__dirname, 'data.json');

async function main() {
  console.log();
  intro(color.inverse(" Vizma "));

  const projectType = await select({
    message: "Pick your ORM.",
    options: [
      { value: "prisma", label: "Prisma" },
      { value: "drizzle", label: "Drizzle" },
      { value: "typeorm", label: "TypeORM", hint: "oh no" },
    ],
  });

  if (isCancel(projectType)) {
    cancel("Operation cancelled");
    return process.exit(0);
  }

  // enter the prisma schema file path
  const schemaFilePath = await text({
    // todo: allow auto completion in the cli
    message: "Enter the Prisma schema file path",
    placeholder: "prisma/schema.prisma",
  });

  if (isCancel(schemaFilePath)) {
    cancel("Operation cancelled");
    return process.exit(0);
  }

  // check if the schema file exists
  if (!existsSync(schemaFilePath)) {
    cancel("Schema file does not exist");
    return process.exit(0);
  }

  const s = spinner();
  s.start("getting schema");

  // read the schema file
  const schema = readFileSync(schemaFilePath, "utf8");
  s.stop("got schema");

  // log the schema file content and path
  const dmmf = await getDMMF({ datamodel: schema });
  // console.log(JSON.stringify(dmmf.datamodel.models, null, 2));

  const nodes = [];
  const edges = [];

  dmmf.datamodel.models.forEach((model, index) => {
    const fields = model.fields.map(field => ({
      name: field.name,
      type: field.type,
      isId: field.isId,
      isUnique: field.isUnique,
      isList: field.isList,
      relation: field.relationName ? { to: field.type, name: field.relationName } : null,
    }));

    nodes.push({
      id: model.name,
      type: 'default', // Changed from 'custom' to 'default'
      data: {
        label: model.name,
        fields, // Include fields for display in the node
      },
      position: { x: index * 300, y: 100 }, // Arbitrary positioning; adjust as needed
    });

    // Create edges based on relations
    model.fields.forEach(field => {
      if (field.relationName && field.kind === 'object') {
        edges.push({
          id: `${model.name}-${field.name}`,
          source: model.name,
          target: field.type,
          label: field.name, // e.g., 'posts' for a one-to-many relation
          type: 'smoothstep', // Or any React Flow edge type
        });
      }
    });
  });

  // Output JSON
  const reactFlowData = { nodes, edges };
  writeFileSync(outputPath, JSON.stringify(reactFlowData, null, 2));

  // s.stop("validating schema");

  outro("You're all set!");

  await sleep(1000);
}

main().catch(console.error);




// async function convertPrismaToReactFlow(schemaPath, outputPath) {
//   try {
//     // Read the schema file
//     const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

//     // Parse to DMMF
//     const dmmf = await getDMMF({ datamodel: schemaContent });

//     // Transform DMMF to React Flow format
//     const nodes = [];
//     const edges = [];

//     // Create nodes for each model
//     dmmf.datamodel.models.forEach((model, index) => {
//       const fields = model.fields.map(field => ({
//         name: field.name,
//         type: field.type,
//         isId: field.isId,
//         isUnique: field.isUnique,
//         isList: field.isList,
//         relation: field.relationName ? { to: field.type, name: field.relationName } : null,
//       }));

//       nodes.push({
//         id: model.name,
//         type: 'custom', // Or use 'default' or a custom node type in React Flow
//         data: {
//           label: model.name,
//           fields, // Include fields for display in the node
//         },
//         position: { x: index * 300, y: 100 }, // Arbitrary positioning; adjust as needed
//       });

//       // Create edges based on relations
//       model.fields.forEach(field => {
//         if (field.relationName && field.kind === 'object') {
//           edges.push({
//             id: `${model.name}-${field.name}`,
//             source: model.name,
//             target: field.type,
//             label: field.name, // e.g., 'posts' for a one-to-many relation
//             type: 'smoothstep', // Or any React Flow edge type
//           });
//         }
//       });
//     });

//     // Handle enums as optional nodes if needed (e.g., for visualization)
//     dmmf.datamodel.enums.forEach((enumModel, index) => {
//       nodes.push({
//         id: enumModel.name,
//         type: 'custom',
//         data: {
//           label: `Enum: ${enumModel.name}`,
//           values: enumModel.values.map(v => v.name),
//         },
//         position: { x: index * 300, y: 400 },
//       });
//     });

//     // Output JSON
//     const reactFlowData = { nodes, edges };
//     fs.writeFileSync(outputPath, JSON.stringify(reactFlowData, null, 2));
//     console.log(`JSON saved to ${outputPath}`);
//   } catch (error) {
//     console.error('Error converting schema:', error);
//   }
// }

// // Usage: Run with node convert-prisma-to-reactflow.js
// const schemaPath = path.join(__dirname, 'schema.prisma'); // Adjust path if needed
// const outputPath = path.join(__dirname, 'reactflow-data.json');
// convertPrismaToReactFlow(schemaPath, outputPath);