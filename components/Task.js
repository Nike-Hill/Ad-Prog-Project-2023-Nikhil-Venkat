//Imports
import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';




// Task fields
var taskName = "Task";
var metric = "boolean";
var units = "units";
var targetUnits = 1.0;
var unitsComplete = 0.0;
var completion = 0.0;
var priority = 2;
var priorityText = "Medium Priority";
var weightage = 5;

complete = false;

//colors
var blue = '#55BCF6';
var green = '#56D245';





//Task constant
const Task = (props) => {
    var taskName = "Task";
    //const [tempCompletion, setCompletion] = useState(0.0);
    const [tempUnitsComplete, setUnitsComplete] = useState(0);

    

    // Task fields
    taskName = props.text;
    priority = props.priority;
    weightage = props.weightage;
    metric = props.metric;
    units = props.units;
    targetUnits = props.targetUnits;
    completion=props.completion;
    useEffect(()=>{
        //completion =(props.unitsComplete / props.targetUnits);
        //unitsComplete =(props.unitsComplete || 0);
      }, [props.unitsComplete, props.targetUnits]);
    
    useEffect(() => {
        const calculateProgress = () => {
        const completedPercentage = unitsComplete/targetUnits;
        completion=(completedPercentage);
        };
    
        calculateProgress();
    }, [unitsComplete, targetUnits]);
  
    // Priority-related variables
    let priorityColor = "#FF9900";
  
    const handleAdd = () => {
    console.log("changed units complete from " + unitsComplete+" to ");
      unitsComplete=(unitsComplete + 1.0);
      //props.onUpdateUnits(props.id, unitsComplete + 1.0);
      console.log( unitsComplete);

    };
  
    const handleSubtract = () => {
    console.log("changed units complete from " + unitsComplete+" to ");
      if (unitsComplete >= 1) {
        unitsComplete=(unitsComplete - 1.0);
       // props.onUpdateUnits(props.id, unitsComplete - 1.0);
       console.log(unitsComplete);
      }


    };

    {/*Update fields from passed props*/}
    taskName = props.text;
    priority = props.priority;
    weightage = props.weightage;

    metric = props.metric;

    console.log("metric: " + metric);
    console.log("units complete: " +unitsComplete);
    console.log("completion: " +completion);


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

                        {(metric == ("incremental") && complete==false) &&(

                            <><Text style={styles.unitsText}>
                                {unitsComplete}/{targetUnits} {units}
                            </Text><TouchableOpacity onPress={handleSubtract}>
                                    <Text style={styles.buttonText}>-</Text>
                                </TouchableOpacity><TouchableOpacity onPress={handleAdd}>
                                    <Text style={styles.buttonText}>+</Text>
                                </TouchableOpacity></>
                        )}
                    </View>
          
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