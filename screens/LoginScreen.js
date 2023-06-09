//imports
import React, { useState, useEffect } from 'react';
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
import { auth } from '../Firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';


const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;




export default function LoginScreen({ navigation }) {

 {/*Initialize email and password constants*/}
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')





  {/*Log in method, checks that username and password are valid before navigating user to the main app*/}
  const login = () => {
    signInWithEmailAndPassword(auth,email,password)
    .then(userCredentials => {
      const user = userCredentials.user;
      console.log('Logged in with:', user.email);
      navigation.replace("MainTabScreen");
    })
    .catch(error => alert(error.message))
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
    {/*Logo*/}
      <Image
        source={require('../assets/logo-v5.png')}
        style={styles.logo}
      />


      <Text style = {styles.boldText}>Log In</Text>

      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.roundedBox} 
          placeholder='Email Address' 
          value = {email}
          onChangeText={text=>setEmail(text)}
          placeholderTextColor="#a1a1a1" 
          keyboardAppearance='dark'
        />

        <TextInput 
          style={styles.roundedBox} 
          placeholder='Password'
          value = {password}
          onChangeText={text=>setPassword(text)}
          secureTextEntry 
          placeholderTextColor="#a1a1a1" 
          keyboardAppearance='dark'
        />
      </View>

      <View style = {styles.buttonContainer}>

        <TouchableOpacity 
          onPress={login} 
          style={styles.button}
        >

          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>


        {/*I haven't implemented log in with socials yet, these buttons do nothing*/}
        <TouchableOpacity  style={[styles.button, styles.buttonOutline]}>
          <Text style={styles.buttonOutlineText}>Sign in with Google</Text>
        </TouchableOpacity>


        <TouchableOpacity  style={[styles.button, styles.buttonOutline]}>
          <Text style={styles.buttonOutlineText}>Sign in with Apple</Text>
        </TouchableOpacity>
      </View>


      {/*This button navigates the user to the sign up screen*/}
      <View style = {styles.wideButtonContainer} >
        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Don't have an account? Sign up for free!</Text>
        </TouchableOpacity>
        
      </View>
    </ScrollView>
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
    marginBottom: 0,
  },

  wideButtonContainer:{
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
    color: 'white',
    placeholderTextColor: 'white',
  },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'space-around',
  },

  navButton: {
    marginTop: 15,
  },
  forgotButton: {
    marginVertical: 35,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2e64e5',
    fontFamily: 'Lato-Regular',
  },

  logo: {
    height: 150,
    width: 150,
    resizeMode: 'cover',
  },
});
