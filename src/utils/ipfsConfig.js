import { Web3Storage } from 'web3.storage';

const API_TOKEN = 'did:key:z6Mkv3joj4ZJycJ5MbvTeob3118eJNdJ1EXLaSVdTFzjc1Hx';

function getWeb3StorageClient() {
    return new Web3Storage({ token: API_TOKEN });
}

// ... rest of the code ... 