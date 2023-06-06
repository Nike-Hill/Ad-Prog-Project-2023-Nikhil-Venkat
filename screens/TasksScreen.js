//Import statements
import React, {useCallback, useRef, useMemo, useState, useEffect } from "react";
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
import { collection, doc, updateDoc, 
  addDoc, serverTimestamp, getDocs, 
  query, where, getDoc, onSnapshot, 
  orderBy,Timestamp } from "firebase/firestore"; 

import Task from "C:/Users/nikhi/apps/MilestoneV0000/components/Task";
import Ionicons from 'react-native-vector-icons/Ionicons';


//Circular Progress Import
import { AnimatedCircularProgress } from "react-native-circular-progress";

import UUIDGenerator from 'react-native-uuid-generator';

//BottomSheet import
import BottomSheet, {BottomSheetView, BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";

//Picker imports
import RNPickerSelect from 'react-native-picker-select';
import DatePicker from 'react-native-modern-datepicker';
import { getToday, getFormatedDate } from 'react-native-modern-datepicker';


//Export
const TaskScreen = ({navigation}) => {
  const [user,setUser] = useState(null)

 
  // Fetch the current user's data
  useEffect(() => {
    const fetchUser = async () => {
      console.log("Fetching user");
      //Make a query in the firestore for users with the same uid as the current user (there will only be one)
      const userQuery = query(collection(firestore, "users"), where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(userQuery);
      querySnapshot.forEach((doc) => {
          console.log(`${doc.id} => ${doc.get("first")} ${doc.get("last")}`);
      });
  
      if (!querySnapshot.empty) {
        //Update fetchedUser with all fields from the doc
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
          //set the user to the fetched user
          setUser(fetchedUser);
      }
    };
        

    fetchUser();
  }, []);

    //Signs user out and navigates back to log in screen
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


  
  //These are all of the possible heights of the bottom sheet.
  const snapPoints = ["1%", "20%", "65%"];

  //This method moves the bottomSheet to the selected position.
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
    setBottomSheetIsOpen(true);
  }, [])
  const inputRef = useRef(null);


  {/*Task field setters*/}
  const [task, setTask] = useState('');
  const [taskPriority, setTaskPriority] = useState(null);
  const [metricType, setMetricType] = useState("boolean");
  const [units, setUnits] = useState('');
  const [targetUnits, setTargetUnits] = useState(null);
  const [weightage, setWeightage] = useState(null);

  //Date stuff
  const [dueDate, setDueDate] = useState(null);
  const minimumDate = getToday();



  //Task arrays & progress
  const [taskItems, setTaskItems] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);

  //Set to store all unique due dates
  const [dueDatesSet, setDueDatesSet] = useState(new Set());


  //Sort Tasks by priority
  const sortedTasks = taskItems.sort((a, b) => a.priority - b.priority);
  const [progress, setProgress] = useState(0);

    //This method fetches tasks from firestore
    const fetchTasks = () => {
      console.log("Fetching tasks...");
      //Make a query for the user's tasks
      while(!user){
        console.log("Waiting for user to be initialized..." + user.id)
      }
      const tasksCollection = collection(firestore, "users", user.id, "tasks");
      const tasksQuery = query(tasksCollection, orderBy("createdTime", "desc"));

      //Set up a listener for query
      const unsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
        //Fetch all of the tasks fields
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} => ${doc.get("taskName")} ${doc.get("metric")}`);
        });

        //Make promises for all of the fields of all of the tasks instead of fetching them normally
        //Because it takes a small but significant amount of time to fix them.
        const fetchedTasksPromises = querySnapshot.docChanges().map(async (change) => {
          if (change.type === "added" || change.type === "modified") {
            const doc = change.doc;
            
            return {
              id:doc.id,
              createdTime: doc.get("createdTime"),
              text: doc.get("taskName"),
              priority: doc.get("priority"),
              metric: doc.get("metric"),
              units: doc.get("units"), 
              targetUnits: doc.get("targetUnits"), 
              weightage: doc.get("weightage"), 
              unitsComplete: doc.get("unitsComplete"), 
              complete: doc.get("complete"),
              dueDate: doc.get("dueDate") ? doc.get("dueDate").toDate():null,
              //updateUnits:updateUnits,
              updateTask: updateTask,
            };
          }
        });
    
        //Once all fields are fetched, update the taskItems and completedTasks arrays
        Promise.all(fetchedTasksPromises).then((fetchedTasks) => {
          //Filter the tasks by completion
          const completedTasks = fetchedTasks.filter(task => task.complete);
          const incompleteTasks = fetchedTasks.filter(task => !task.complete);    
         
          // update due dates set
          fetchedTasks.forEach(task => {
            if(task.dueDate) {
              setDueDatesSet(prevDatesSet => {
                prevDatesSet.add(task.dueDate);
                return new Set(prevDatesSet);
              });
            }
          });
          
          setTaskItems(prevTasks => {
            // Remove the tasks that were changed
            const unchangedTasks = prevTasks.filter(task => !fetchedTasks.find(fetchedTask => fetchedTask.id === task.id));
            // Then add the updated tasks
            return [...unchangedTasks, ...incompleteTasks];
          });
    
          setCompletedTasks(prevTasks => {
            // Remove the tasks that were changed
            const unchangedTasks = prevTasks.filter(task => !fetchedTasks.find(fetchedTask => fetchedTask.id === task.id));
            // Then add the updated tasks
            return [...unchangedTasks, ...completedTasks];
          });
            });
      });
    
      return unsubscribe;
    };
        

    //Continuously fetch tasks
    useEffect(() => {
      console.log("user data changed, refetching tasks")
      if (user) {
        const unsubscribe = fetchTasks();
        return () => unsubscribe(); 
      }
    }, [user]);  //Runs when user data changes
    
    
    


    
  //This method calculates the progress on the day's tasks, which is displayed on a circular progress indicator.
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
      /*
      console.log('taskName:', task.text, typeof task.taskName);
      console.log('task.weightage:', task.weightage, typeof task.weightage);
      console.log('task.completion:', task.completion, typeof task.completion);
      console.log('completedWeight:', completedWeight, typeof completedWeight);
      console.log("----------------------------------------------------------");
      console.log("                                                           ");
      */

      totalWeight += (task.weightage);
      if(task.metric=="incremental"){
        /*
        console.log("Adding progress of "+task.taskName+ 
        " (Weightage " + task.weightage+", completion " +task.completion+")");
        console.log("(unitsComplete: "+task.unitsComplete+", targetUnits: "+task.targetUnits+")");
        */
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


  //Calculates progress whenever taskItems or completedTasks is changed.
  useEffect(() => {
    console.log("Calculating progress...")
    calculateProgress();
  }, [taskItems, completedTasks]);

  {/*Method passed to each task to update data in firestore whenever the tasks' data is modified.*/}
  const updateTask = async (taskId, updatedData, updatedDataString) => {
    const taskRef = doc(firestore, "users", user.id, "tasks", taskId);
  
    try {
      //Update Firestore
      console.log('Updating task '+taskId.toString()+' with data '+updatedDataString);
      await updateDoc(taskRef, updatedData).then(()=>fetchTasks()).then(() => {


      })
      console.log('Updated task '+taskId.toString()+' with data '+updatedDataString);
      console.log('Task Updated!');
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  }
  
  
  {/*Task functions*/}

  //This method adds the new task to the Firestore if the
  const handleAddTask = async () => {
    Keyboard.dismiss();
    if (task&&taskPriority&& metricType && weightage && !(metricType==="incremental" && (!units || !targetUnits)) && dueDate) {
      //UUIDGenerator.getRandomUUID().then((uuid) => {
        console.log("Adding task...")
        await addDoc(collection(firestore, "users", user.id, "tasks"), {
          createdTime: serverTimestamp(),
          taskName: task,
          priority: taskPriority-1,
          metric: metricType,
          units: units, 
          targetUnits: targetUnits, 
          weightage: weightage, 
          unitsComplete: 0, 
          complete: false,
          //Convert date string to date
          dueDate: Timestamp.fromDate(new Date(parseInt(dueDate.substring(0,4)), 
                                               parseInt(dueDate.substring(5,7))-1, 
                                               parseInt(dueDate.substring(8)), 23, 59, 59)),
        })
        .then(() => {
            console.log('Task Added!');
            Alert.alert(
              'Task Added!',
              'Your task \''+task+'\' has been added Successfully!',
            );
          }
        ).then(()=>fetchTasks())
        .catch((error)=> {
          console.log('Something went wrong while adding your task to firestore!');
        })
        //setTaskItems([...taskItems, taskWithPriority]);
        //Reset all task fields and close BottomSheet
        setTask(null);
        setTaskPriority(null);
        setUnits(null);      
        setTargetUnits(null);
        setMetricType("boolean");
        setWeightage(null);
        setDueDate(null);
        inputRef.current.clear(); 
        handleSnapPress(0);
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
      <Text style= {styles.titleWrapper}>{user ? "Hi "+user.values.first+"!" : "Your Tasks: "}</Text>

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
          tintColor="#03befc"
          tintColorSecondary="#56D245"

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
            {/* Iterating through dueDatesSet */}
            {Array.from(dueDatesSet).sort().map((date, index) => {
                //Spliting an IOSString by T gives the strings
                //"YYYY-MM-DD" and HH:MM:SS"
                //We can compare dates while ignoring time by just
                //using the first of these two strings.
                const tasksForThisDate = sortedTasks.filter
                (task => task.dueDate && task.dueDate.toISOString().split('T')[0] 
                === date.toISOString().split('T')[0]);

                return (
                    <View key={index}>
                        {/* Header for this date */}
                        <Text style={styles.sectionTitle}>{date.toISOString().split('T')[0]}'s Tasks</Text>

                        {/* Iterate through tasks for this date */}
                        {tasksForThisDate.map((item, index) => {
                            return (
                                <TouchableOpacity key={index} onPress={null} onLongPress={() => removeTask(index)}>
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
                                    complete={item.complete}
                                    dueDate={item.dueDate}
                                    updateTask={updateTask}
                                />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                );
            })}

            {/* Completed Tasks */}
            {completedTasks.length === 0 ? null : (
                <Text style={styles.sectionTitle} paddingTop = {15} paddingBottom={30}>Completed</Text>
            )}

            {/* Iterate through completedTasks and display all tasks */}
            {completedTasks.map((item, index) => {
                return (
                    <TouchableOpacity key={index} onPress={null} onLongPress={() => removeCompleteTask(index)}>
                    <Task                       
                        key={item.id}
                        id={item.id}
                        text={item.text}
                        priority={item.priority}
                        weightage={item.weightage}
                        units={item.units}
                        metric={item.metric}
                        targetUnits={item.targetUnits}
                        unitsComplete={item.unitsComplete}
                        complete={item.complete}
                        dueDate={item.dueDate}
                        updateTask={updateTask}
                    />
                    </TouchableOpacity>
                );
            })}
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
        handleStyle={{backgroundColor: '#100333', height:1}}       
      >
        {/*BottomSheet with add task menu*/}
        <BottomSheetView
            style={styles.bottomSheetContentContainer}
            padding={10}
          >
            <ScrollView            >
              <Text style={styles.sectionTitle}>Add Task</Text>
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
                          <Ionicons name="ios-add-circle" color={'#220c5e'} size={58}/>
                        </View>
                      </TouchableOpacity>
                    </View>
                
                    <View style={styles.whiteRoundedBox}>
                      {/*Priority picker, each priority corresponds to a numerical value that is used to sort the tasks when displayed*/}
                      <Text style={styles.pickerLabel}>Priority:</Text>
                      <RNPickerSelect
                        style={pickerSelectStylesNoBorder}
                        value={taskPriority}
                        onValueChange={(value) => setTaskPriority(value)}
                        items={[
                          { label: 'Critical', value: 1},
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
                      {metricType === "boolean" && (

                        <><TouchableOpacity
                      style={[                                                         
                        styles.metricTypeBubble,
                        metricType === 'boolean' ? styles.metricTypeBubbleSelected : {},
                      ]}
                      onPress={() => { setMetricType("boolean"); } }>
                      <Text style={styles.selectedButtonText} color={(metricType == "boolean") ? "#D6C7A1" : "#FFF"}>True/False</Text>
                    </TouchableOpacity><TouchableOpacity
                      style={[
                        styles.metricTypeBubble,
                        metricType === 'incremental' ? styles.metricTypeBubbleSelected : {},
                      ]}
                      onPress={() => { setMetricType("incremental"); } }>
                        <Text style={styles.buttonText}>Incremental</Text>
                      </TouchableOpacity></>
                      )}

                      {metricType === "incremental" && (

                      <><TouchableOpacity
                      style={[
                      styles.metricTypeBubble,
                      metricType === 'boolean' ? styles.metricTypeBubbleSelected : {},
                      ]}
                      onPress={() => { setMetricType("boolean"); } }>
                      <Text style={styles.buttonText} color={(metricType == "boolean") ? "#D6C7A1" : "#FFF"}>True/False</Text>
                      </TouchableOpacity><TouchableOpacity
                      style={[
                      styles.metricTypeBubble,
                      metricType === 'incremental' ? styles.metricTypeBubbleSelected : {},
                      ]}
                      onPress={() => { setMetricType("incremental"); } }>
                      <Text style={styles.selectedButtonText}>Incremental</Text>
                      </TouchableOpacity></>
                      )}
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
                              items={[...Array(500)].map((_, i) => ({ label: `${i + 1}`, value: i + 1 }))} 
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
                  
                    <View style={styles.verticalRoundedBox}>
                      
                      <Text  style= {styles.dueDateSubheading}>
                        Due date:
                      </Text>
                      <DatePicker
                        options={{
                          backgroundColor: '#090C08',
                          textHeaderColor: '#FFA25B',
                          textDefaultColor: '#F6E7C1',
                          selectedTextColor: '#fff',
                          mainColor: '#F4722B',
                          textSecondaryColor: '#D6C7A1',
                          borderColor: 'rgba(122, 146, 165, 0.1)',
                          current: dueDate,
                        }}
 
                        mode="calendar"
                        minimumDate={minimumDate}
                        style={{ borderRadius: 10 }}
                        onDateChange={date => {
                          console.log("Changing duedate to " + date)
                          setDueDate(date)
                        
                        }}
                      />
                    </View>

                  </View>
                </KeyboardAvoidingView>
              </ScrollView>
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
    backgroundColor: '#0c0129',
  },

  titleWrapper: {
    paddingTop:54,
    paddingBottom:20,
    paddingHorizontal:20,
    backgroundColor: '#090C08',    
    color: '#FFF',
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
    backgroundColor: '#090C08',
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
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
    fontWeight: '700',
    fontSize: 16,
    color: 'white',
  },

  selectedButtonText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#FFA25B',
  },
  addWrapper: {
    width: 57,
    height: 57,
    backgroundColor: '#0c0129',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    paddingLeft: 2,
  },
  
  addSheetOpenerWrapper: {
    width: 90,
    height: 40,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFA25B',
    borderWidth: 1,
  },

  addText: {
    color: '#bcbcbc',
    fontSize: 60,
    marginStart: 3,
    marginBottom: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
  },

  addSheetOpenerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFA25B',
  },


  smallMessage: {
    color: '#D6C7A1',
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
    color: '#FFF',

  },

  bottomSheetContentContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#090C08',

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
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#FFF',
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  verticalRoundedBox: {
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#FFF',
    padding: 20,
    marginTop: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  picker: {
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 20,

    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 5,
    backgroundColor: '#090C08',

  },

  pickerLabel: {
    fontSize: 16,
    alignSelf: 'center',
    color: '#FFF',
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
    color: '#FFF',
  },

  dueDateSubheading: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#FFF',
    marginBottom: 10,
  }, 

  metricTypeBubble: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  metricTypeBubbleSelected: {
    backgroundColor: '#000000',
    borderColor: '#FFA25B',
  },
  unitsInput: {
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 6,
    color: '#FFA25B',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#FFA25B',
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#FFA25B',

  },
});

const pickerSelectStylesNoBorder = StyleSheet.create({
  inputIOS: {
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#FFA25B',
  },
  inputAndroid: {
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#FFA25B',

  },
});
