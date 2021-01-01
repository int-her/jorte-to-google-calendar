import { promises as fs } from 'fs';
import * as csvWriter from 'csv-writer';

export const readFile = async (path: string) => {
  return await fs.readFile(path, 'utf8')
}

export const writeFile = async (path: string, header: { id: string, title: string }[], contents: []) => {
  csvWriter.createObjectCsvWriter({ path, header })
    .writeRecords(contents)
    .then(() => console.log(`The CSV file was written successfully: ${path}`));
}
