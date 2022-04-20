import React, { useState }from 'react'
import { useMoralis, useMoralisFile } from 'react-moralis'
import { Moralis } from 'moralis'

function Main() {
    const { authenticate, isAuthenticated, isAuthenticating, user, account, logout } = useMoralis();
    const {saveFile, moralisFile} = useMoralisFile()
    const [file, setFile] = useState('')

    const login = async () => {
        if (!isAuthenticated) {
            await authenticate({signingMessage: "Log in using Moralis" })
                .then(function (user) {
                    console.log("logged in user:", user);
                    console.log(user.get("ethAddress"));
              })
              .catch(function (error) {
                console.log(error);
              });
        }
    }


    const logOut = async () => {
        await logout();
        console.log("logged out");
    }


    //Upload an image
    const uploadImage = async (f) => {
        console.log("FILE",f)
        const fileIpfs = await saveFile(f.name, file, {saveIPFS: true})
        console.log(fileIpfs)
    
    
    
        // const CIDImage = Moralis.Object.extend("CIDImage");
        // const cidimage = new CIDImage();
                
        // const data = fileInput.files[0]
        // const file = new Moralis.File(data.name, data)
        // await file.saveIPFS();
        
        // console.log('Image ipfs:')
        // console.log(file.ipfs(), file.hash()) //file.ipfs is link, hash is hash of it
        
        // cidimage.set('cid', file.hash());
        // await cidimage.save();
        
        // return file.ipfs(); //url where is the image is stored
    }
    
    //Upload metadata object: name, description, image
    // const uploadMetadata = async (imageURL) => {
    //     const User = Moralis.Object.extend("Users");
    //     const user = new User();
    //     const name = document.getElementById('metadataName').value;
    //     const description = document.getElementById('metadataDescription').value;
        
    //     const metadata = {
    //         "name": name,
    //         "description": description,
    //         "image": imageURL,
    //     }
                
        
    //     const file = new Moralis.File("file.json", {base64 : btoa(JSON.stringify(metadata))});
                
    //     await file.saveIPFS();
        
    //     user.set('Name', name);
    //     user.set('CID',file.hash());
    //     await user.save();
    //     console.log('Metadata:')
    //     console.log(file.ipfs(), file.hash());
    // }
        
    //Function to upload
    const upload = async () => {
        uploadImage(file[0])
        // const image = await uploadImage();
        // await uploadMetadata(image)
    }

  return (
    <div>
        <h1>Moralis Backend test</h1>
        <button onClick={login}>Moralis Metamask Login</button>
        <button onClick={logOut} disabled={isAuthenticating}>Logout</button>
        <p>Users Name</p>
        <input type="text" name="metadataName" id="metadataName" placeholder="name"></input>
        <p>Users Description</p>
        <textarea name="metadataDescription" id="metadataDescription" cols={30} rows={10}></textarea>
        <p>Users Picture</p>
        <input type="file" name="fileInput" id="fileInput" onChange={(e) => setFile(e.target.files[0])} ></input>
    
        <button onClick={upload}>Upload</button>
        <p>Get the CID based on Users name:</p>
        <input type="text" name="userName" id="userName"></input>
        {/* <button onClick="get()">Get</button> */}
    </div>
  )
}

export default Main