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
        formData.append('pinataMetadata', JSON.stringify({
            name: file.name,
            keyvalues: metadata
        }))
        
        // Add options
        formData.append('pinataOptions', JSON.stringify({
            cidVersion: 0
        }))
        
        const response = await fetch('/api/upload-to-ipfs', {
            method: 'POST',
            body: formData
        })
        
        if (!response.ok) {
            throw new Error('Failed to upload to IPFS')
        }
        
        const data = await response.json()
        return {
            success: true,
            cid: data.cid,
            url: `https://gateway.pinata.cloud/ipfs/${data.cid}`
        }
    } catch (error) {
        console.error('IPFS upload error:', error)
        return {
            success: false,
            error: error.message
        }
    }
} 