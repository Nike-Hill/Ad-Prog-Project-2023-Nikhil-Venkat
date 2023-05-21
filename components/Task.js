//Imports
import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';




// Task fields
var taskName = "Task";
var metric = "boolean";
var units = "units";
var targetUnits = 1.0;
var completion = 0.0;
var unitsComplete = 0;
var priority = 2;
var priorityText = "Medium Priority";
var weightage = 5;

complete = (completion >= 1.0);

//colors
var blue = '#55BCF6';
var green = '#56D245';






//Task constant
const Task = (props) => {
    var taskName = "Task";
    const [tempCompletion, setCompletion] = useState(0.0);
    const [tempUnitsComplete, setUnitsComplete] = useState(0);

    // Task fields
    taskName = props.text;
    priority = props.priority;
    weightage = props.weightage;
    metric = props.metric;
    units = props.units;
    targetUnits = props.targetUnits;
    useEffect(async () => {
        await setCompletion(props.unitsComplete / props.targetUnits)
            completion =tempCompletion;
        await setUnitsComplete(props.unitsComplete || 0)
            unitsComplete =tempUnitsComplete;
      }, [props.unitsComplete, props.targetUnits]);
      
  
    // Priority-related variables
    let priorityColor = "#FF9900";
  
    const handleAdd = () => {
      setUnitsComplete(unitsComplete + 1.0);
      props.onUpdateUnits(props.id, unitsComplete + 1.0);
    };
  
    const handleSubtract = () => {
      if (unitsComplete >= 1) {
        setUnitsComplete(unitsComplete - 1);
        props.onUpdateUnits(props.id, unitsComplete - 1.0);
      }
    };

    {/*Update fields from passed props*/}
    taskName = props.text;
    priority = props.priority;
    weightage = props.weightage;

    metric = props.metric;

    if(metric==="incremental"){
        units = props.units;
        targetUnits = props.targetUnits;
    }

    {/*Set priority text and color based on priority level*/}
    switch (priority){
        case 0:
            priorityText = "Critical";
            priorityColor = '#FF0000';   
            break;

        case 1:
            priorityText = "High Priority";
            priorityColor = '#FF4300';
            break;

        case 2:
            priorityText = "Medium Priority";
            priorityColor = '#FF9900';
            break;

        case 3:
            priorityText = "Low Priority";
            priorityColor = '#FFDD00';
            break;
    
        case 4:
            priorityText = "Optional";
            priorityColor = '#97FF00';
            break;
    }

    const getPriority = () => {
        return priority;
      }

    {/*complete = props.complete || false; // set the complete variable based on the complete prop, or default to false*/}

    //UI
    return (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <View style={styles.contentColumn}>
                    <View style={styles.contentRow}>
                        <View style={styles.square}></View>
                        <Text style={styles.itemText}>{taskName.substring(0, 12)}</Text>
                        <Text style={styles.priorityText(priorityColor)}>  {'('+priorityText+', '+weightage+'%)'}</Text>
                    </View>
                    {metric === "incremental" && complete === false &&(
                        <View style={styles.contentRow}>

                            <Text style={styles.unitsText}>
                                {unitsComplete}/{targetUnits} {units}
                            </Text>

                            <TouchableOpacity onPress={handleSubtract}>
                                <Text style={styles.buttonText}>-</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleAdd}>
                                <Text style={styles.buttonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
            <View style={[styles.circular, {borderColor: (complete ? green : blue)}]}></View>
        </View>
    )
}


//Styles
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

    priorityText: (color) => ({
        fontSize: 12,
        color: color,
    }),

    contentColumn: {
        flexDirection: 'column',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        paddingHorizontal: 10,
    },
    
});

//Export
export default Task;