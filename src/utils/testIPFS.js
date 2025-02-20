import axios from 'axios'
import FormData from 'form-data'
import { createReadStream, writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Pinata API credentials
const PINATA_API_KEY = 'f06e5fd1f9bd46842319'
const PINATA_SECRET_KEY = '8860a2b0c4cc09b36797ebf7f1b05026705ce60c97d65687eba30ef2651517cd'

async function testConnection() {
    try {
        const formData = new FormData()
        
        // Create a test file on disk
        const testContent = 'Hello, IPFS!'
        const testFilePath = join(process.cwd(), 'test.txt')
        writeFileSync(testFilePath, testContent)

        // Add file to form data
        formData.append('file', createReadStream(testFilePath))

        console.log('Uploading test file...')
        
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                maxBodyLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY
                }
            }
        )

        // Clean up test file
        unlinkSync(testFilePath)

        const ipfsHash = response.data.IpfsHash
        const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
        
        console.log('Upload completed. Hash:', ipfsHash)
        console.log('File URL:', url)

        return {
            success: true,
            hash: ipfsHash,
            url
        }

    } catch (error) {
        console.error('Error uploading to IPFS:', error.response?.data || error.message)
        return {
            success: false,
            error: error.response?.data || error.message
        }
    }
}

// Run the test
testConnection()
    .then(result => {
        if (result.success) {
            console.log('✅ Upload successful!')
            console.log('You can view your file at:', result.url)
        } else {
            console.log('❌ Upload failed:', result.error)
        }
    }) 