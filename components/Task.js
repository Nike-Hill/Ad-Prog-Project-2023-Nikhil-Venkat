import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
var taskName = "";
var complete = false;
var blue = '#55BCF6';
var green = '#56D245';


const Task = (props) => {

    if(props.text==null){
        taskName = "Task ";
    } else{
        taskName = props.text;
    }
    
    const complete = props.complete || false; // set the complete variable based on the complete prop, or default to false

    return (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <View style={styles.square}></View>
                <Text style={styles.itemText}>{taskName}</Text>
            </View>
            <View style={[styles.circular, {borderColor: (complete ? green : blue)}]}></View>
        </View>
    )
}



const styles = StyleSheet.create({
    item: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',      
    },
    square: {
        width: 24,
        height: 24,
        backgroundColor: blue,
        opacity: 0.4,
        borderRadius: 5,
        marginRight: 15,
    },
    taskName: {
        maxWidth: '80%',
    },
    circular: {
        width: 12,
        height: 12,
        borderColor: blue,
        borderWidth: 2,
        borderRadius: 5,
    },
});

export default Task;