//Imports
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';

import { auth, firestore } from '../Firebase/firebase';
import { collection, addDoc } from "firebase/firestore"; 


import {createUserWithEmailAndPassword} from 'firebase/auth';

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function SignupScreen({ navigation }) {
  {/*Initialize constants for all fields*/}
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    accountType: "",
    email: "",
    pwd: "",
    pwd2: "",
  })

  {/*Update values when user changes any field*/}
  function handleChange(text, eventName){
    setValues(prev => {
      return {
        ...prev,
        [eventName]: text
      }
    })

  }

 {/*This function verifys that the user has filled out all fields and if so, it creates and account and logs them in.*/}
  function handleSignUp() {
    const { email, pwd, pwd2, firstName, lastName, accountType } = values
  
    if(firstName.length<=0){
      alert("Please enter your first name")
    } else if(lastName.length<=0){
      alert("Please enter your last name")
    }  else if(email.length<=0){
      alert("Please enter your email")
    }else if(pwd.length<=0){
      alert("Please enter a password")
    } else if(pwd!==pwd2){
      alert("Passwords don't match")
    }    else {
      createUserWithEmailAndPassword(auth, email, pwd)
        .then(async () => {
          // Signed up successfully, now create a document in Firestore for the user
      
          {/*Store user data in a firestore doc*/}
          console.log("Signed up with this uid: " + auth.currentUser.uid);
          try {
            const docRef = await addDoc(collection(firestore, "users"), {
              uid: auth.currentUser.uid,
              first: firstName,
              last: lastName,
              email: email,
            });
            console.log("Document written with ID: ", docRef.id);
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        })
        .then(() => {
          console.log("Registered");
          console.log("Registered with:", email, values.toString());
          navigation.replace("MainTabScreen");
        })
        .catch((error) => {
          alert(error.message);
        });
    }
  }
  

  //UI
  return (
    <View
      style={styles.container}
      behavior="padding"
    >
      <ScrollView>
        <Image
        source={require('../assets/signupImage.png')}
        style={styles.image}
      />
        <View style={styles.inputContainer}>

          {/*Text Inputs*/}
          <View style={styles.rowContainer}>
            <TextInput
              style={styles.roundedBox}
              maxWidth='49%'
              placeholder='First Name'
              onChangeText={text => handleChange(text, "firstName")} 
              placeholderTextColor="#a1a1a1" 
              keyboardAppearance='dark'
              />

            <TextInput
              style={styles.roundedBox}
              maxWidth='49%'
              placeholder='Last Name'
              onChangeText={text => handleChange(text, "lastName")} 
              placeholderTextColor="#a1a1a1" 
              keyboardAppearance='dark'
              />
          </View>


          <TextInput
            style={styles.roundedBox}
            placeholder='Email Address'
            onChangeText={text => handleChange(text, "email")} 
            placeholderTextColor="#a1a1a1" 
            keyboardAppearance='dark'
            />



          <TextInput
            style={styles.roundedBox}
            placeholder='Password'
            onChangeText={text => handleChange(text, "pwd")}
            secureTextEntry 
            placeholderTextColor="#a1a1a1" 
            keyboardAppearance='dark'
            />
          <TextInput
            style={styles.roundedBox}
            placeholder='Confirm Password'
            onChangeText={text => handleChange(text, "pwd2")}
            secureTextEntry 
            placeholderTextColor="#a1a1a1" 
            keyboardAppearance='dark'
            />
        


            {/*I haven't implemented sign up with socials yet, these buttons do nothing*/}
            </View><View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSignUp}
                >
                  <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.buttonOutline]}>
                  <Text style={styles.buttonOutlineText}>Sign up with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.buttonOutline]}>
                  <Text style={styles.buttonOutlineText}>Sign up with Apple</Text>
                </TouchableOpacity>


              </View>
              </ScrollView>
    </View>
  );
}

//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#090C08',
  },

  inputContainer:{
    width: '95%',
  },


  buttonContainer:{
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 50,
  },

  image: {
    height: 210,
    width: 240,
    marginTop: 50,
    resizeMode: 'cover',
    alignSelf: 'center',
  },

  wideButtonContainer:{
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 70,
  },

  button: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#0782F9',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    minWidth: windowWidth*0.44,
    backgroundColor: '#090C08',
    borderColor: 'white',
    borderWidth: 2,

  },

  buttonOutline: {
    backgroundColor: 'white',
    marginTop: 5,
    borderColor: '#5034abff',
    borderWidth: 2,
    backgroundColor: '#090C08',
  },

  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },


  buttonOutlineText: {
    color: '#5034abff',
    fontWeight: '700',
    fontSize: 16,
  },

  boldText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: 'white',
  },

  roundedBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFF',
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '49%',
    color: 'white',
  },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'space-around',
  },

  subheading: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 10,
  },

});
