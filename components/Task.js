//Imports
import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Checkbox from  'expo-checkbox';
import TextTicker from 'react-native-text-ticker'




// Task fields
var metric = "boolean";
var units = "units";
var priority = 2;
var priorityText = "Medium Priority";
var weightage = 5;



//colors
var blue = '#55BCF6';
var green = '#56D245';





//Task constant
const Task = (props) => {
    var taskName = "Task";
    const getName=()=>{return taskName};
    var unitsComplete = 0;
    var targetUnits = 1.0;

    const [completion, setCompletion] = useState(0);
    var complete = false;
    const getComplete = () => {
        return complete;
    }
    
    var id = "";

    //const [tempCompletion, setCompletion] = useState(0.0);

    

    // Task fields
    taskName = props.text;
    priority = props.priority;
    weightage = props.weightage;
    metric = props.metric;
    units = props.units;
    targetUnits = props.targetUnits;
    unitsComplete = props.unitsComplete;
    updateUnits = props.updateUnits;
    updateTask = props.updateTask;
    complete= props.complete;

    id = props.id;


    //completion=props.completion;
    useEffect(()=>{
        //completion =(props.unitsComplete / props.targetUnits);
        //unitsComplete =(props.unitsComplete || 0);
      }, [props.unitsComplete, props.targetUnits]);
    
    //Calculates completion whenever unitsComplete or targetUnits is modified.
    useEffect(() => {
        const calculateProgress = () => {
        const completedPercentage = unitsComplete/targetUnits;
        setCompletion(completedPercentage);
        };
    
        calculateProgress();
    }, [unitsComplete, targetUnits]);
  
    // Priority-related variables
    let priorityColor = "#FF9900";


    //Method called to increment unitsComplete
    const handleAdd = async () => {
        console.log("changed units complete from " + unitsComplete+" to ");
        const newUnitsComplete = unitsComplete + 1.0;        
        //Call updateTask function passed from App.js to update unitsComplete in Firestore
        //updateUnits(complete, targetUnits, unitsComplete, newUnitsComplete, setComplete, setUnitsComplete, weightage);
        await updateTask(id,{unitsComplete: newUnitsComplete}, "unitsComplete: "+newUnitsComplete).then( () => {
            if(newUnitsComplete>=targetUnits){
                updateTask(id,{complete: true}, "Complete: true")
            }
            console.log(unitsComplete);
        }
        )

    };
    
    
    //Method called to decrement unitsComplete
    const handleSubtract = async () => {
        console.log("changed units complete from " + unitsComplete+" to ");
        const newUnitsComplete = unitsComplete - 1.0;
        //Make sure unitsComplete isn't being decremented below zero.
        if (newUnitsComplete >= 0) {
            //Call updateTask function passed from App.js to update unitsComplete in Firestore
            updateTask(id,{unitsComplete: newUnitsComplete},"unitsComplete: "+newUnitsComplete);
            console.log(newUnitsComplete);
        } else {
            updateTask(id,{unitsComplete: 0},"unitsComplete: "+0);

        }

        if(newUnitsComplete<targetUnits){
            updateTask(id,{complete: false}, "Complete: false")
        }
        console.log(unitsComplete);

    };


    

    {/*Update fields from passed props*/}
    taskName = props.text;
    priority = props.priority;
    weightage = props.weightage;
    metric = props.metric;
    updateUnits = props.updateUnits;
    updateTask = props.updateTask;
    id = props.id;
    unitsComplete = props.unitsComplete;
    complete= props.complete;


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
        <><View style={styles.item}>
            <View style={styles.itemLeft}>
                <View style={styles.contentRow}>

                    <View style={styles.square}></View>

                    <View style={styles.contentColumn}>

                        <View style={styles.contentRow}>
                            <TextTicker
                                minWidth={'40%'}

                                maxWidth={'40%'}
                                duration={500+200*(taskName.length)}
                                animationType={'scroll'}
                                //loop
                                style={styles.itemText}
                                repeatSpacer={0}
                                marqueeDelay={0}
                                ellipsizeMode={'clip'}
                            >
                            {taskName.length<=12 ? `${taskName}                                     `: ` ${taskName}                                     ${taskName}                                     ${taskName}                                     `}

                            </TextTicker>

                            <TextTicker

                                duration={3000}
                                animationType={'auto'}
                                loop={true}
                                bounce={true}

                                ellipsizeMode={'clip'}
                                repeatSpacer={0}
                                marqueeDelay={0}
                                style={styles.priorityText(priorityColor)}
                            >
                                {'(' + priorityText + ', ' + weightage + '%)'}

                            </TextTicker>
                        </View>

                        {/*If the metric is incremental and the task is incomplete, the user will be able to change the amount of units complete/*/}
                        {(metric === ("incremental")) && (

                            <>
                                <View style={styles.contentRow}>

                                    <Text style={styles.unitsText}>
                                        {unitsComplete}/{targetUnits} {units}
                                    </Text>

                                    <View style={styles.whiteRoundedBox}>
                                        <TouchableOpacity style={styles.circularButton} onPress={handleSubtract}>
                                            <Text style={styles.buttonText}>-</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.circularButton} onPress={handleAdd}>
                                            <Text style={styles.buttonText}>+</Text>
                                        </TouchableOpacity>
                                    </View>




                                </View>
                            </>
                        )}




                    </View>




                </View>

            </View>

            {/*If the metric is boolean, the user will be able to mark the task complete/incomplete*/}
            {(metric == "boolean") && (
                <View style={styles.contentRow}>
                    <Checkbox 
                        value={complete} 
                        onValueChange={async (newValue) => {
                            // Update 'complete' in Firestore
                            updateTask(id, { complete: !complete }, "Complete: " + (!complete));
                                updateTask(id,{unitsComplete: 1-unitsComplete}, "unitsComplete: " + (1-unitsComplete));
                        }} 
                    />

                </View>
            )}

            {(metric !=   "boolean")&&(
                //The color of this circle indicates whether the task is complete or not.

                <View style={[styles.circular, { borderColor: (complete ? green : blue) }]}></View>


            )}
        </View></>
    
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

    whiteRoundedBox: {
        backgroundColor: '#FFF',
        borderRadius: 60,
        borderWidth: 1,
        borderColor: '#C0C0C0',
        padding: 4,
        marginTop: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: '12%',

      },

    itemText: {
        fontSize:16,
        fontWeight: 'bold',
    },

    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',      
    },

    circularButton: {
        width: 30,
        height: 30,
        backgroundColor: '#FFF',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#C0C0C0',
        borderWidth: 1,
        marginHorizontal: 2,
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
        fontSize: 14,
        color: color,
        fontWeight: "700",
    }),

    contentColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',

    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        maxWidth: '95%'
    },
    incrementalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "900",
        marginBottom: 3,
        marginStart: 1,

    },

    unitsText: {
        fontSize: 12,
        fontWeight: "700",
        width: '55%',
    }
    
});  

//Export
export default Task;