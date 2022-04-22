import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisFile } from "react-moralis";
import { Moralis } from "moralis";
import abi from "../utils/UserStorage.json";
import {Button, Col, Row} from "react-bootstrap";

function Main() {
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis();

  const ethers = Moralis.web3Library;

  const { saveFile, moralisFile } = useMoralisFile();
  const [image, setImage] = useState("");
  const [metadata, setMetadata] = useState("");
  const [users, setUsers] = useState([]);

  // variables for blockchain
  const contractAddress = "0xe1B6A87aa756ca246913BBE9105D7Ccc437CC31f";
  const contractABI = abi.abi;

  const login = async () => {
    if (!isAuthenticated) {
      await authenticate({ signingMessage: "Log in using Moralis" })
        .then(function (user) {
          console.log("logged in user:", user);
          console.log(user.get("ethAddress"));
        })
          // .then(async () => {
          //     await getAllUsers();
          // })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  useEffect(() => {
      getAllUsers();
      // if (user) {
      //     console.log("They are actually authenticated")
      //     getAllUsers();
      // }
  }, [])

  const logOut = async () => {
    await logout();
    await getAllUsers();
    console.log("logged out");
  };

  //Upload an image
  const uploadImage = async () => {
    const CIDImage = Moralis.Object.extend("CIDImage");
    const cidimage = new CIDImage();

    // const data = fileInput.files[0];
    const data = image[0];
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS();

    console.log("Image ipfs:");
    console.log(file.ipfs(), file.hash()); //file.ipfs is link, hash is hash of it

    cidimage.set("cid", file.hash());
    await cidimage.save();

    return file.ipfs(); //url where is the image is stored
  };

  //   Upload metadata object: name, description, image
  const uploadMetadata = async (imageURL) => {
    const User = Moralis.Object.extend("Users");
    const user = new User();
    const name = document.getElementById("metadataName").value;
    const description = document.getElementById("metadataDescription").value;

    const metadata = {
      name: name,
      description: description,
      image: imageURL,
    };

    const file = new Moralis.File("file.json", {
      base64: btoa(JSON.stringify(metadata)),
    });

    await file.saveIPFS();

    user.set("Name", name);
    user.set("CID", file.hash());
    await user.save();
    console.log("Metadata:");
    console.log(file.ipfs(), file.hash());
  };

  //Function to upload
  const upload = async () => {
    const imageInMetadata = await uploadImage(image[0]);
    await uploadMetadata(imageInMetadata);
    await postNewUser();
  };

  //Function to get
  const get = async () => {
    const query = new Moralis.Query("Users");

    const userName = document.getElementById("userName").value;
    query.equalTo("Name", userName);
    const user = await query.first();
    const userCID = user.attributes.CID;
    const url = `https://gateway.moralisipfs.com/ipfs/${userCID}`;
    console.log(user);
    console.log(user.attributes);
    console.log(url);
  };

  // Getting all users from the blockchain
    const getAllUsers = async () => {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userStorageContract = new ethers.Contract(contractAddress, contractABI, signer);

        const blockchainUsers = await userStorageContract.getAllUsers();
        setUsers(blockchainUsers);

        console.log("Here are our users: ")
        console.log(users)
    }

    // Adding a new user to the blockchain
    const postNewUser = async () => {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userStorageContract = new ethers.Contract(contractAddress, contractABI, signer);
        const userName = document.getElementById("metadataName").value;

        await userStorageContract.addUser(userName)
    }

  return (
    <div>
            <h1 className="py-3" style={{color: 'white'}}>Backend Prototype</h1>
          {/*<Row sm={6}>*/}
          <Button variant="primary" onClick={login}>Moralis Metamask Login</Button>
          {/*</Row>*/}
          {/*<Row sm={6}>*/}
              <Button className="mx-3" variant="danger" onClick={logOut} disabled={isAuthenticating}>
              Logout
          </Button>
          {/*</Row>*/}

        <h2 className="mt-3" style={{color: 'wheat'}}>All Users</h2>
        {users.map((user, index) => {
            return (
                <div className="mx-5" key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
                    <div>Name: {user.name}</div>
                    <div>Address: {user.userAddress}</div>
                </div>)
        })}
      <h3 className="my-3" style={{color: 'wheat'}}>Users Name</h3>
      <input
        type="text"
        name="metadataName"
        id="metadataName"
        placeholder="name"
      ></input>
      <h3 className="my-3" style={{color: 'wheat'}}>Users Description</h3>
      <textarea
        name="metadataDescription"
        id="metadataDescription"
        cols={30}
        rows={10}
      ></textarea>
      <h3 className="my-3" style={{color: 'wheat'}}>Users Picture</h3>
      <input
        type="file"
        name="fileInput"
        id="fileInput"
        onChange={(e) => setImage(e.target.files)}
      ></input>

      <Button variant="success" onClick={upload}>Upload</Button>
      <h3 className="my-3" style={{color: 'wheat'}}>Get the CID based on Users name:</h3>
      <input className="mx-1 mb-3" type="text" name="userName" id="userName"></input>
      <Button className="mx-3 mb-3" variant="primary" onClick={get}>Get</Button>
    </div>
  );
}

export default Main;
