import axios from 'axios'
import FormData from 'form-data'
import dotenv from 'dotenv'

dotenv.config()

const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY

export async function uploadToIPFS(file, metadata = {}) {
    try {
        const formData = new FormData()
        
        // Add file
        formData.append('file', file)
        
        // Add metadata
        const metadataJSON = JSON.stringify({
            name: file.name,
            keyvalues: {
                ...metadata,
                timestamp: new Date().toISOString()
            }
        })
        formData.append('pinataMetadata', metadataJSON)

        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                maxBodyLength: 'Infinity',
                headers: {
                    ...formData.getHeaders(),
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY
                }
            }
        )

        return {
            success: true,
            ipfsHash: response.data.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
        }

    } catch (error) {
        console.error('IPFS upload error:', error)
        return {
            success: false,
            error: error.response?.data || error.message
        }
    }
} 