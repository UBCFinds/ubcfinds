import { mockUtilities } from '../../components/utility-list'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const csvHeader = 'Name,Type,Building,Floor,Id,Latitude,Longitude'
const csvRows = mockUtilities.map(utility => 
  `"${utility.name}","${utility.type}","${utility.building}","${utility.floor}","${utility.id}",${utility.position.lat},${utility.position.lng}`
)

const csvContent = [csvHeader, ...csvRows].join('\n')

const outputPath = path.join(__dirname, '../source-data/utilities.csv')
fs.writeFileSync(outputPath, csvContent, 'utf-8')
console.log(`✅ Exported ${mockUtilities.length} utilities to ${outputPath}`)
