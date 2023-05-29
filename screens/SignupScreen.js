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

        <Text style={styles.boldText}>Sign Up</Text>

        <View style={styles.inputContainer}>

          {/*Text Inputs*/}
          <View style={styles.rowContainer}>
            <TextInput
              style={styles.whiteRoundedBox}
              maxWidth='49%'
              placeholder='First Name'
              onChangeText={text => handleChange(text, "firstName")} />

            <TextInput
              style={styles.whiteRoundedBox}
              maxWidth='49%'
              placeholder='Last Name'
              onChangeText={text => handleChange(text, "lastName")} />
          </View>


          <TextInput
            style={styles.whiteRoundedBox}
            placeholder='Email Address'
            onChangeText={text => handleChange(text, "email")} />


          <Text style={styles.subheading}>Account Type:</Text>

          <TextInput
            style={styles.whiteRoundedBox}
            placeholder='Password'
            onChangeText={text => handleChange(text, "pwd")}
            secureTextEntry />
          <TextInput
            style={styles.whiteRoundedBox}
            placeholder='Confirm Password'
            onChangeText={text => handleChange(text, "pwd2")}
            secureTextEntry />
        


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

                <TouchableOpacity style={[styles.button, styles.buttonOutline]}>
                  <Text style={styles.buttonOutlineText}>Sign up with Meta</Text>
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
  },

  inputContainer:{
    width: '95%',
  },

  input: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'black',
    paddingHorizontal: 10,
    marginTop: 5,
  },

  buttonContainer:{
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 50,
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
  },

  buttonOutline: {
    backgroundColor: 'white',
    marginTop: 5,
    borderColor: '#0782F9',
    borderWidth: 2,
  },

  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },


  buttonOutlineText: {
    color: '#0782F9',
    fontWeight: '700',
    fontSize: 16,
  },

  boldText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 25,

  },

  whiteRoundedBox: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '49%',
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

  rolesBubble: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  rolesBubbleSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
});
