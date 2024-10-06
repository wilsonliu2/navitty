require("dotenv").config();

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs'); 
const path = require('path');
// const { db } = require('./mongodb');

API_Key = process.env.API_Key;
API_Secret = process.env.API_Secret;
 
/**
 * Uploads a file to IPFS using Pinata's pinning service.
 *
 * @param {string} filePath - The path to the file that needs to be uploaded.
 * @param {string} caption - A caption or description for the file.
 * @returns {Promise<string>} - A promise that resolves to the IPFS hash of the uploaded file.
 *
 * @throws {Error} - Throws an error if the upload fails.
 */

const uploadToIPFS = async (filePath, caption) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const metadata = JSON.stringify({
        name: "UserUpload",
        keyvalues: {
            caption: caption
        }
    });

    formData.append('pinataMetadata', metadata);
    const options = JSON.stringify({
        cidVersion: 1
    });

    formData.append('pinataOptions', options);

    //where we send the images
    const response = await axios.post(url, formData, {
        maxBodyLength: 'Infinity', // needed for larger iamge files
        headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            'pinata_api_key': API_Key,
            'pinata_secret_api_key': API_Secret,
        }
    });

    const ipfsHash = response.data.IpfsHash;
    
    await insertData({ ipfsHash, caption });

    return ipfsHash;
}


/**
 * Downloads a file from IPFS using the provided IPFS hash and saves it to the specified destination path.
 *
 * @param {string} ipfsHash - The IPFS hash of the file to be downloaded.
 * @param {string} destinationPath - The path where the downloaded file will be saved.
 * @returns {Promise<string>} - A promise that resolves to the file path of the downloaded file.
 * @throws {Error} - Throws an error if the file cannot be downloaded from IPFS.
 */
const downloadFromIPFS = async (ipfsHash, destinationPath) => {
    try {
        const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
        });

        const fileName = path.join(destinationPath, `${ipfsHash}.jpg`);
        const writer = fs.createWriteStream(fileName);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                resolve(fileName);
            });
            writer.on('error', reject);
        });

    } catch (error) {
        console.error('Error downloading image from IPFS:', error);
        throw new Error('Unable to download file from IPFS.');
    }
}

(async () => {
    const ipfsHash = 'bafkreieomeqtrn4r5b6jvngyg2y4jigoo2gvownxqlisc24o7tmz4fhapa'; // gona replace this with actual hash
    const destinationPath = './downloads'; // path where the file will be saved (for now)
    const downloadedFile = await downloadFromIPFS(ipfsHash, destinationPath);
    console.log('File downloaded at:', downloadedFile);
})();

module.exports = {
    uploadToIPFS, 
    downloadFromIPFS 
  };