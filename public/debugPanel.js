// Debug functions for testing Firebase integration
function showDebugPanel() {
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel) {
        debugPanel.style.display = 'block';
    } else {
        console.error('Debug panel not found in the DOM');
    }
}

// Function to create a test document in Firebase
function createTestDocument() {
    if (!firebaseDb) {
        console.error('Firebase Database not initialized');
        alert('Firebase Database not initialized. Please check console.');
        return;
    }
    
    const timestamp = new Date().getTime();
    const docId = `TEST1234F_electricity_${timestamp}`;
    
    const testData = {
        service: 'electricity',
        panNumber: 'TEST1234F',
        userDetails: {
            name: 'Test User',
            dob: '01-01-1990',
            address: '123, Test Street, Test City'
        },
        walletAddress: userWalletAddress || '0x1234567890abcdef',
        fileDetails: {
            fileName: 'test_document.pdf',
            fileURL: 'https://example.com/file.pdf',
            fileSize: 1024,
            contentType: 'application/pdf'
        },
        status: 'Test',
        createdAt: timestamp,
        testMode: true
    };
    
    console.log('Creating test document with ID:', docId);
    console.log('Test data:', testData);
    
    // Save to Firebase
    firebaseDb.ref('userDocuments/' + docId).set(testData, error => {
        if (error) {
            console.error('Error creating test document:', error);
            alert('Failed to create test document: ' + error.message);
        } else {
            console.log('Test document created successfully!');
            alert('Test document created successfully! Check Firebase console under /userDocuments');
            
            // Log the URL to view this document in Firebase console
            const consoleUrl = `https://console.firebase.google.com/project/blocksmiths-a8021/database/blocksmiths-a8021-default-rtdb/data/userDocuments/${docId}`;
            console.log('View document in Firebase console:', consoleUrl);
        }
    });
}

// Function to list all documents in the userDocuments collection
function listAllDocuments() {
    if (!firebaseDb) {
        console.error('Firebase Database not initialized');
        alert('Firebase Database not initialized. Please check console.');
        return;
    }
    
    const userDocsRef = firebaseDb.ref('userDocuments');
    userDocsRef.once('value', snapshot => {
        if (snapshot.exists()) {
            const documents = [];
            snapshot.forEach(childSnapshot => {
                documents.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            console.log('Found', documents.length, 'documents:');
            console.table(documents);
            alert(`Found ${documents.length} documents. Check console for details.`);
        } else {
            console.log('No documents found in the userDocuments collection');
            alert('No documents found in the userDocuments collection');
        }
    }, error => {
        console.error('Error listing documents:', error);
        alert('Error listing documents: ' + error.message);
    });
}

console.log('Debug functions loaded. You can now use:');
console.log('- showDebugPanel() - Show the debug panel');
console.log('- createTestDocument() - Create a test document in Firebase');
console.log('- listAllDocuments() - List all documents in the userDocuments collection'); 