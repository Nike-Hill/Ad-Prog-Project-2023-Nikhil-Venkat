//Import statements
import React, {useCallback, useRef, useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Keyboard,
  Animated,
  Alert,
} from "react-native";

import { storage, ref, firestore, auth } from '../Firebase/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, getDoc, onSnapshot } from "firebase/firestore"; 

import Task from "C:/Users/nikhi/apps/MilestoneV0000/components/Task";

//Circular Progress Import
import { AnimatedCircularProgress } from "react-native-circular-progress";

import UUIDGenerator from 'react-native-uuid-generator';

//BottomSheet import
import BottomSheet, {BottomSheetView, BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";

//Picker import
import RNPickerSelect from 'react-native-picker-select';


//Export
const TaskScreen = ({navigation}) => {
  const [user,setUser] = useState(null)

  // Fetch the current user's data
  useEffect(() => {
    const fetchUser = async () => {
      //Make a query in the firestore for users with the same uid as the current user (there will only be one)
      const userQuery = query(collection(firestore, "users"), where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(userQuery);
      querySnapshot.forEach((doc) => {
          console.log(`${doc.id} => ${doc.get("first")} ${doc.get("last")}`);
      });
  
      if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const fetchedUser = {
              id: doc.id,
              values: {
                  first: doc.get("first"),
                  last: doc.get("last"),
                  tasks: doc.get("tasks"),
                  uid: doc.get("uid"),
                  email: doc.get("email"),
              },
          };
  
          setUser(fetchedUser);
      }
  };
      
    fetchUser();
  }, []);

    const handleSignOut = () => {
        auth
            .signOut()
            .then(()=> {
              navigation.replace("Login")
            })
            .catch(error=>alert(error.message))
    }

  {/*Dimensions constants*/}
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  {/*BottomSheet Constants*/}
  const sheetRef = useRef(null);
  const [bottomSheetIsOpen, setBottomSheetIsOpen] = useState(true);
  const transparentHandleStyle = {
    backgroundColor: 'transparent',
  };
  const snapPoints = ["1%", "23%", "46%"];
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
    setBottomSheetIsOpen(true);
  }, [])
  const inputRef = useRef(null);


  {/*Task field setters*/}
  const [task, setTask] = useState('');
  const [taskPriority, setTaskPriority] = useState(null);
  const [metricType, setMetricType] = useState(null);
  const [units, setUnits] = useState('');
  const [targetUnits, setTargetUnits] = useState(null);
  const [weightage, setWeightage] = useState(null);

  {/*Task arrays & progress*/}
  const [taskItems, setTaskItems] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  //Sort Tasks by priority
  const sortedTasks = taskItems.sort((a, b) => a.priority - b.priority);
  const [progress, setProgress] = useState(0);

  {/*Method passed to each task to update screen when user increments/decrements units complete*/}

  const calculateProgress = () => {
    const totalTasks = taskItems.length + completedTasks.length;
    var totalWeight = 0.0;
    var completedWeight = 0.0;
    //Multiply completion by weightage to find the total progress made
    completedTasks.forEach(task => {
      completedWeight += (task.weightage);
    });
    totalWeight+=completedWeight;
    taskItems.forEach(task => {
      console.log('taskName:', task.text, typeof task.taskName);
      console.log('task.weightage:', task.weightage, typeof task.weightage);
      console.log('task.completion:', task.completion, typeof task.completion);
      console.log('completedWeight:', completedWeight, typeof completedWeight);
      console.log("----------------------------------------------------------");
      console.log("                                                           ");

      totalWeight += (task.weightage);
      if(task.metric=="incremental"){
        console.log("Adding progress of "+task.taskName+ " (Weightage " + task.weightage+", completion " +task.completion+")");
        console.log("(unitsComplete: "+task.unitsComplete+", targetUnits: "+task.targetUnits+")");
        completedWeight += (task.weightage*task.unitsComplete/task.targetUnits);

      }
    });
    
    

    //Calculate Progress by dividing the tasks complete by the total tasks, adjusting both for weightage
    console.log("Progress:");
    console.log("Completed(weighted): " + completedWeight);
    console.log("Total(weighted): " + totalWeight);
    setTotalWeight(totalWeight);

    const completedPercentage = totalTasks > 0 ? (completedWeight / (totalWeight)) * 100 : 0;
    setProgress(completedPercentage);
  };

  
  const updateUnits = async (complete, targetUnits, oldUnitsComplete, unitsComplete, setComplete,setUnitsComplete, weightage) => {
    //If the incremental task is finished, set complete to true.
    if(unitsComplete>=targetUnits){
      await setComplete(true);
      await completeTasks();
      calculateProgress();
    } else{
      calculateProgress();
    }
    

    setProgress(progress+(weightage*(unitsComplete-oldUnitsComplete)/targetUnits)/totalWeight*100);
  };


  //Calculates progress whenever taskItems or completedTasks is changed.
  useEffect(() => {
    calculateProgress();
  }, [taskItems, completedTasks]);


  
  {/*Task functions*/}
  const handleAddTask = async () => {
    Keyboard.dismiss();
    if (task&&taskPriority&& metricType && weightage && !(metricType==="incremental" && (!units || !targetUnits))) {
      //UUIDGenerator.getRandomUUID().then((uuid) => {
        const taskWithPriority = { text: task, priority: taskPriority-1, metric: metricType, units: units, targetUnits: targetUnits, weightage: weightage, unitsComplete: 0, updateUnits: updateUnits};
        await addDoc(collection(firestore, "users", user.id, "tasks"), {
          userId: auth.currentUser.uid,
          cratedTime: serverTimestamp(),
          taskName: task,
          priority: taskPriority-1,
          metric: metricType,
          units: units, 
          targetUnits: targetUnits, 
          weightage: weightage, 
          unitsComplete: 0, 
        })
        .then(() => {
            console.log('Task Added!');
            Alert.alert(
              'Task Added!',
              'Your task has been added Successfully!',
            );
          }
        )
        .catch((error)=> {
          console.log('Something went wrong while adding your task to firestore!');
        })
        console.log(taskWithPriority);
        setTaskItems([...taskItems, taskWithPriority]);
        //Reset all task fields and close BottomSheet
        setTask(null);
        setTaskPriority(null);
        setUnits(null);      
        setTargetUnits(null);
        setMetricType(null);
        setWeightage(null);
        inputRef.current.clear(); 
        handleSnapPress(0);
        console.log("task added with name "+taskWithPriority.text+" and id "+taskWithPriority.id);

      //});
    {/*Notify user if they didn't fill out all fields*/}
    } else{
      alert("Please fill out all fields");
    }

  };
  
  //completeTask moves the selected task from the taskItems array to the completedTasks array
  const completeTask = (index) => {
    const itemsCopy = [...taskItems];
    const completedTask = itemsCopy.splice(index, 1);
    setCompletedTasks([...completedTasks, ...completedTask]);
    setTaskItems(itemsCopy);
  };
  

  const completeTasks = () => {
    const itemsCopy = taskItems.filter(task => !task.complete);
    const completedTasksCopy = [...completedTasks, ...taskItems.filter(task => task.complete)];

    setTaskItems(itemsCopy);
    setCompletedTasks(completedTasksCopy);
};


  //uncompleteTask moves the selected task from the completedTasks array to the taskItems array
  const uncompleteTask = (index) => {
    const itemsCopy = [...completedTasks];
    const uncompletedTask = itemsCopy.splice(index, 1);
    setTaskItems([...taskItems, ...uncompletedTask]);
    setCompletedTasks(itemsCopy);
  }

  //removeTask removes the selected task from the taskItems array
  const removeTask = (index) => {
    const itemsCopy = [...taskItems];
    itemsCopy.splice(index, 1);
    setTaskItems(itemsCopy);
  }

  //removeCompleteTask removes the selected task from the completedTasks array
  const removeCompleteTask = (index) => {
    const itemsCopy = [...completedTasks];
    itemsCopy.splice(index, 1);
    setCompletedTasks(itemsCopy);
  }


  
  const editTask = (index) => {

  }


  
  {/*UI*/}
  return  (
      
    <View style={styles.container}>

      {/*Title*/}
      <Text style= {styles.titleWrapper}>Todo List</Text>

      <ScrollView> 
        {/*Today's Tasks*/}
               
        {/*Circular progress indicator*/}
        <AnimatedCircularProgress
          style={styles.progressIndicator}
          size={300}
          width={15}
          marginBottom={50}
          //Use progress variable for progress
          fill={progress}
          tintColor="#56D245"
          onAnimationComplete={() => console.log("onAnimationComplete")}
          backgroundColor="#3d5875"
          animated
        >
          {(fill) => <Animated.Text style={styles.progressText}>{`${Math.round(progress)}%`}</Animated.Text>}
        </AnimatedCircularProgress>


        {/*Today's tasks header*/}
        <View style={styles.taskWrapper}>  
            <View style={styles.todaysTasksContainer}>
                <Text style={styles.sectionTitle}>Today's Tasks</Text>
                {/*Add task button*/}
                <TouchableOpacity onPress={() => handleSnapPress(2)}>
                    <View style={styles.addSheetOpenerWrapper}>
                        <Text style={styles.addSheetOpenerText}>Add</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/*Message that appears if there are no remaining tasks*/}
            {taskItems.length === 0 ? (
                <Text style={styles.smallMessage}>
                You've completed all of your tasks today!
                </Text>
            ) : null}

            <View style={styles.items}>
                {/*This is where the tasks will go*/}
                {/*Change to sorted later*/}
                {/*Iterate through taskItems and display all tasks*/}
                {sortedTasks.map((item, index) => {
                return (
                    <TouchableOpacity key={index} onPress={item.metric!=="incremental"?() => completeTask(index):null} onLongPress={() => removeTask(index)}>
                    <Task
                        key={item.id}
                        id={item.id}
                        text={item.text}
                        priority={item.priority}
                        weightage={item.weightage}
                        units={item.units}
                        metric={item.metric}
                        unitsComplete={item.unitsComplete}
                        targetUnits={item.targetUnits}
                        complete={false}
                        updateUnits={updateUnits}
                    />
                    </TouchableOpacity>
                );
                })}


                {completedTasks.length === 0 ? null : (
                <Text style={styles.sectionTitle} paddingTop = {15} paddingBottom={30}>Completed</Text>
                ) }

                {/*Iterate through completedTasks and display all tasks*/}
                {completedTasks.map((item, index) => {
                return (
                    <TouchableOpacity key={index} onPress={() => uncompleteTask(index)} onLongPress={() => removeCompleteTask(index)}>
                    <Task                       key={item.id}
                        id={item.id}
                        text={item.text}
                        priority={item.priority}
                        weightage={item.weightage}
                        units={item.units}
                        metric={item.metric}
                        targetUnits={item.targetUnits}
                        unitsComplete={item.unitsComplete}

                        complete={true}
                        updateUnits={updateUnits}

                    />
                    </TouchableOpacity>
                );
                })}


            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                    <Text style={styles.buttonText}>Sign out</Text>
            </TouchableOpacity>
        </View>


      </ScrollView>

      {/*Write a task*/}

      {/*Bottom Sheet View*/}
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        //enablePanDownToClose={true}
          //Set tracking variable for stqate of bottomsheet to false
        onClose={() => setBottomSheetIsOpen(false)}
        handleStyle={transparentHandleStyle}       
      >
        {/*BottomSheet with add task menu*/}
        <BottomSheetView
            style={styles.bottomSheetContentContainer}
            backgroundColor='#c0c0c2'
            padding={10}
        >
            <Text style={styles.addTaskTitle}>Add Task</Text>
            <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.writeTaskWrapper}
            >
              {/*Task name field*/}
              <View style = {styles.addTaskContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder={'Write a task'}
                  value={task}
                  width={'80%'}
                  onChangeText={text => setTask(text)}
                  />
                  <TouchableOpacity onPress={() => handleAddTask()}>
                    <View style={styles.addWrapper}>
                        <Text style={styles.addText}>+</Text>
                    </View>
                  </TouchableOpacity>
              </View>
              
              <View style={styles.whiteRoundedBox}>
                {/*Priority picker, each priority corresponds to a numerical value that is used to sort the tasks when displayed*/}
                <Text style={styles.pickerLabel}>Priority:</Text>
                <RNPickerSelect
                  style={styles.picker}
                  value={taskPriority}
                  onValueChange={(value) => setTaskPriority(value)}
                  items={[
                    { label: 'Critical', value: 1 },
                    { label: 'High Priority', value: 2 },
                    { label: 'Medium Priority', value: 3 },
                    { label: 'Low Priority', value: 4 },
                    { label: 'Optional', value: 5 },
                  ]}
                  placeholder={{ label: 'Select Priority', value: null }}
                />
              </View>


                <View style={styles.addTaskMenuRow}>
                  <Text style={styles.addTaskSubheading}>Metric Type:</Text>
                  <TouchableOpacity
                    style={[
                      styles.metricTypeBubble,
                      metricType === 'boolean' ? styles.metricTypeBubbleSelected : {},
                    ]}
                    onPress={() => {setMetricType("boolean")}}>
                    <Text style={styles.buttonText}>True/False</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.metricTypeBubble,
                      metricType === 'incremental' ? styles.metricTypeBubbleSelected : {},
                    ]}
                    onPress={() => {setMetricType("incremental")}}>
                    <Text style={styles.buttonText}>Incremental</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.addTaskMenuRow}>
                  
                  {/*If the metric type is incremental, the user will be able to set the amount and type of units.*/}
                  {metricType === "incremental" && (
                    <>
                      <View style={styles.whiteRoundedBox}>

                        <Text style={styles.addTaskSubheading}>Goal: </Text>

                        <RNPickerSelect
                          style={pickerSelectStyles}
                          value={targetUnits}
                          onValueChange={(value) => setTargetUnits(value)}
                          items={[...Array(300)].map((_, i) => ({ label: `${i + 1}`, value: i + 1 }))} 
                          placeholder={{ label: 'Amount', value: null }}

                        />
                        <TextInput
                          style={styles.unitsInput}
                          maxWidth={'34%'}
                          placeholder="Units"
                          onChangeText={(text) => setUnits(text)}
                          value={units}
                        />
                      </View>

                    

                    </>
                  )}

                  <View style={styles.whiteRoundedBox}>
                    <Text style={styles.addTaskSubheading}>Weightage: </Text>
                    <RNPickerSelect
                      style={pickerSelectStyles}
                      value={weightage}
                      onValueChange={(value) => setWeightage(value)}
                      items={[...Array(100)].map((_, i) => ({ label: `${100 - i}%`, value: 100 - i }))}
                      placeholder={{ label: 'Select', value: null }}

                    />
                  </View>
              
                </View>
              </View>
            </KeyboardAvoidingView>

          </BottomSheetView>
      </BottomSheet>



    </View>
    
  )}
//}


export default TaskScreen;
// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
  },

  titleWrapper: {
    paddingTop:54,
    paddingBottom:20,
    paddingHorizontal:20,
    backgroundColor: '#E8EAED',
    fontSize: 39,
    fontWeight: 'bold',

  },
  taskWrapper: {
    paddingTop: 33,
    paddingBottom: 430,
    paddingHorizontal:20,
    borderRadius: 60,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    backgroundColor: '#D4D5D8',
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  items: {
    marginTop: 30,
  },

  writeTaskWrapper: {
    width: '100%',
    justifyContent: 'flex-start', // Change to 'flex-start'
    alignItems: 'center',
  },
  

  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 60,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    width: 280,
    marginRight: 15,
  },
  button: {
    width: '60%',
    alignItems: 'center',
    backgroundColor: '#0782F9',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginTop: 40,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  
  addSheetOpenerWrapper: {
    width: 90,
    height: 40,
    backgroundColor: '#c0c0c2',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },

  addText: {
    color: '#bcbcbc',
    fontSize: 20,
    fontWeight: 'bold',
  },

  addSheetOpenerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },


  smallMessage: {
    color: '#AAABAD',
    paddingHorizontal: 100,
    paddingTop: 80,
    paddingBottom: 140,
  },
  
  nullText: {
    fontSize: 0.001,
    padding: 0,
  },

  progressIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 15,
    margin: 10,
   

  },


  progressText: {
    fontSize: 70,
    fontWeight: 'bold',
    lineHeight: 300,
    textAlign: 'center',
    marginTop: 5,
    marginStart: 75,

  },

  bottomSheetContentContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },  

  addTaskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'flex-start', // Align the text to the start (left) of the container
    marginLeft: 20, // Add left margin
    marginTop: 20, // Add top margin
  },

  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  addTaskContainer: {
    justifyContent: 'space-around',
    marginTop: 20, // Add top margin to separate the input from the title
  },

  todaysTasksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  whiteRoundedBox: {
    backgroundColor: '#FFF',
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  

  picker: {
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 20,

    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#C0C0C0',
    borderRadius: 5,
    backgroundColor: '#FFF',
  },

  pickerLabel: {

    fontSize: 16,
    alignSelf: 'center',

    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  
  addTaskMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  addTaskSubheading: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  metricTypeBubble: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  metricTypeBubbleSelected: {
    backgroundColor: '#000000',
  },
  unitsInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 6,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
