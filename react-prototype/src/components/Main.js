import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import abi from "../utils/UserStorage.json";
import {Button, Col, Figure, FormControl, FormGroup, FormLabel, Row} from "react-bootstrap";
import FigureImage from "react-bootstrap/FigureImage";

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

  const [image, setImage] = useState(null);
  const [users, setUsers] = useState([]);
  const [gotInfo, setGotInfo] = useState(false);
  const [ipfsUser, setIpfsUser] = useState(null);

  // variables for blockchain
  const contractAddress = "0xe1B6A87aa756ca246913BBE9105D7Ccc437CC31f";
  const contractABI = abi.abi;

  const login = async () => {
    if (!isAuthenticated) {
      await authenticate({ signingMessage: "Log in using Moralis" })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  useEffect(() => {
      getAllUsers();
  }, [])

  const logOut = async () => {
    await logout();
    await getAllUsers();
  };

  //Upload an image
  const uploadImage = async () => {
    const CIDImage = Moralis.Object.extend("CIDImage");
    const cidimage = new CIDImage();

    // const data = fileInput.files[0];
    const data = image[0];
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS();

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
    const response = await fetch(url);
    setIpfsUser(await response.json());
    setGotInfo(true);
  };

  // Getting all users from the blockchain
    const getAllUsers = async () => {
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const userStorageContract = new ethers.Contract(contractAddress, contractABI, signer);

            const blockchainUsers = await userStorageContract.getAllUsers();
            setUsers(blockchainUsers);
        }
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
    <div className="pb-3">
        <h1 className="py-3" style={{color: 'white'}}>Backend Prototype</h1>
          <Button variant="primary" onClick={login}>Moralis Metamask Login</Button>
          <Button className="mx-3" variant="danger" onClick={logOut} disabled={isAuthenticating}>
          Logout
          </Button>
        <h2 className="mt-3" style={{color: 'wheat'}}>All Users</h2>
        {users.map((user, index) => {
            return (
                <div className="mx-5" key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
                    <div>Name: {user.name}</div>
                    <div>Address: {user.userAddress}</div>
                </div>)
        })}
        <Row className="justify-content-center my-3">
            <Col sm="4">
                <FormGroup>
                    <FormLabel style={{fontSize: '30px', color: 'wheat'}}>User Name</FormLabel>
                    <FormControl className="" id="metadataName" type="text" placeholder="Name"/>
                </FormGroup>
            </Col>
        </Row>
        <Row className="justify-content-center my-3">
            <Col sm="4">
                <FormGroup>
                    <FormLabel style={{fontSize: '30px', color: 'wheat'}}>User Description</FormLabel>
                    <FormControl className="" as="textarea" id="metadataDescription" placeholder="Description"/>
                </FormGroup>
            </Col>
        </Row>
        <Row className="justify-content-center my-3">
            <Col sm="4">
                <FormGroup>
                    <FormLabel style={{fontSize: '30px', color: 'wheat'}}>User Picture</FormLabel>
                    <FormControl className="" onChange={(e) => setImage(e.target.files)} type="file" id="fileInput"/>
                </FormGroup>
            </Col>
        </Row>
      <Button variant="success" onClick={upload}>Upload</Button>
        <Row className="justify-content-center my-3">
            <Col sm="4">
                <FormGroup>
                    <FormLabel style={{fontSize: '30px', color: 'wheat'}}>Get the CID based on Users name:</FormLabel>
                    <FormControl className="" type="text" id="userName" placeholder="Name"/>
                </FormGroup>
            </Col>
        </Row>
      <Button className="mx-3 mb-3" variant="primary" onClick={get}>Get</Button>
        {
            gotInfo &&
            <div className="pb-3">
                <Row className="justify-content-center my-3">
                    <FormLabel style={{fontSize: '30px', color: 'wheat'}}>{ipfsUser.name}'s image</FormLabel>
                    <Figure>
                        <FigureImage src={ipfsUser.image} />
                    </Figure>
                </Row>
                <Row className="justify-content-center my-3">
                    <Col sm="4">
                        <FormGroup>
                            <FormLabel style={{fontSize: '30px', color: 'wheat'}}>{ipfsUser.name}'s Description</FormLabel>
                            <FormControl className="" as="textarea" value={ipfsUser.description} readOnly={true}/>
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        }
    </div>
  );
}

export default Main;
