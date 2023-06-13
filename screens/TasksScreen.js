//Imports
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


import moment from 'moment';

import { storage, ref, firestore, auth } from '../Firebase/firebase';
import { collection, doc, updateDoc, 
  addDoc, serverTimestamp, getDocs, 
  query, where, getDoc, deleteDoc, onSnapshot, 
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
const TasksScreen = ({navigation}) => {
  const [user,setUser] = useState(null)

  const todaysTasks = [];

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
            .catch(error=>alert('Error signing out: ', error.message))
    }

  {/*Dimensions constants*/}
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  {/*BottomSheet Constants*/}
  const sheetRef = useRef(null);
  const [bottomSheetIsOpen, setBottomSheetIsOpen] = useState(true);


  
  //These are all of the possible heights of the bottom sheet.
  const snapPoints = ["1%", "23%", "65%"];

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
  const today = new Date(parseInt(minimumDate.substring(0,4)), 
  parseInt(minimumDate.substring(5,7))-1, 
  parseInt(parseInt(minimumDate.substring(8)), 0, 0, 0));


  //Task arrays & progress
  const [taskItems, setTaskItems] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);

  //Set to store all unique due dates
  const [dueDatesSet, setDueDatesSet] = useState(new Set());


  //Sort Tasks by priority
  const sortedTasks = taskItems.sort((a, b) => a.priority - b.priority);


    //This method fetches tasks from firestore
    const fetchTasks = async () => {
      console.log("Fetching tasks...");
      //Make a query for the user's tasks
      while(!user){
        console.log("Waiting for user to be initialized..." + user.id)
      }
      const tasksCollection = collection(firestore, "users", user.id, "tasks");
      const tasksQuery = query(tasksCollection, orderBy("createdTime", "desc"));

      // get docs
      const querySnapshot = await getDocs(tasksQuery);
      const fetchedTasks = [];

      for (let change of querySnapshot.docChanges()) {
        if (change.type === "added" || change.type === "modified") {
          const doc = change.doc;

          //Push data of current task to fetchedTasks array
          fetchedTasks.push({
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
            dueDate: (doc.get("dueDate") ? doc.get("dueDate").toDate():null),
            updateTask: updateTask,         
           });
        }
      }

      //Update task arrays
      const todayString = today.toISOString().slice(0,10);
      const completedTasks = fetchedTasks.filter(task => task?.complete && 
        task?.dueDate?.toISOString().slice(0,10) == todayString);
      const incompleteTasks = fetchedTasks.filter(task => !task?.complete);
      setTaskItems(incompleteTasks);
      setCompletedTasks(completedTasks);
    };
    
    
        
    //Fetch tasks once user is fetched
    useEffect(() => {
      console.log("user data changed, refetching tasks")
      if (user) {
        const unsubscribe = fetchTasks();
        return () => unsubscribe(); 
      }
    }, [user]);  //Runs when user data changes
    
    
  {/*Method passed to each task to update data in firestore whenever the tasks' data is modified.*/}
  const updateTask = async (taskId, updatedData, updatedDataString) => {
    const taskRef = doc(firestore, "users", user.id, "tasks", taskId);
  
    try {
      //Update Firestore
      console.log('Updating task '+taskId.toString()+
      ' with data '+updatedDataString);
      
      await updateDoc(taskRef, updatedData).then(()=>fetchTasks()).then(() => {


      })
      console.log('Updated task '+taskId.toString()+
      ' with data '+updatedDataString);
      console.log('Task Updated!');
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  }
  
  
  {/*Task functions*/}

  //This method adds the new task to the Firestore if the
  const handleAddTask = async () => {
    Keyboard.dismiss();
    if (task&&taskPriority&& metricType && weightage && !(metricType===
      "incremental" && (!units || !targetUnits)) && dueDate) {
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
                                               parseInt(dueDate.substring(8)), 0, 0, 0)),
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
      handleSnapPress(2);

    }

  };
  

  //Called when user long presses on task, prompts confirmation
  //of task deletion
  const handleDelete = (taskId, index, complete) => {
    Alert.alert(
      'Delete task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
          color: '#FF0000',
        },

        {
          text: 'Confirm',
          onPress: () => deletetask(taskId, index, complete),
        },

      ],

      {cancelable: false}
    );
  }


  //delete task function is called when user confirms task deletion, 
  //and deletes task both locally and on Firestore.
  const deletetask = async (taskId,index,complete) => {
    console.log('Current task Id: ', taskId)
    const docRef = doc(firestore, "users", user?.id, "tasks", taskId);
    const docSnap = await getDoc(docRef);
    console.log('Current doc snapshot: ', docSnap);
    if(docSnap){
      //Delete the task item from the local array that it's stored in.
      const tasksArray = complete? completedTasks : taskItems;
      await tasksArray.splice(index, 1)
      .then(console.log("tasksArray: "+tasksArray))
      //Delete the doc from firestore      
      .then(deleteDoc(doc(firestore, "users", user?.id, "tasks", taskId))
      .then(fetchTasks()));
      
      Alert.alert('Task deleted!');
    }
  }


  
  const editTask = (index) => {

  }

  // Helper function to render tasks for a particular date
  function renderTasksForDate(dateTitle, tasks, key, showDateTitle, active) {
    return (
      <View key={key}>
        {(dateTitle!="blank" && dateTitle!="Overdue Tasks"&&showDateTitle)&&(
          <><Text style={styles.sectionTitle}>{moment(dateTitle, "MM/DD/YYYY")
          .add(1,'days').add(23,  'hours').add(59, 'minutes').calendar()}</Text></>
        )}

        {/*Overdue tasks title at the top of the overdue section*/}
        {(dateTitle=="Overdue Tasks"&&key==0)&&(
              <Text style={styles.overdueTitle}>Overdue Tasks</Text>
        )}

        {tasks.map((item, index) => (
          (item)&&(
          //Render the task
          <TouchableOpacity key={index} onPress={null} 
          onLongPress={() => handleDelete(item.id, index, item.complete)}>
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
              active={active}
            />
          </TouchableOpacity>)

        ))
        
        }


      </View>
    );
  }

  //Construct Maps for each task category
  const overdueTasksByDate = new Map();
  const todaysTasksByDate = new Map();
  const futureTasksByDate = new Map();
  sortedTasks.forEach(item => {
    // Converts the date object to be a string with format yyyy-mm-dd
    const dueDateString = item?.dueDate?.toISOString().slice(0,10); 
    console.log("Duedatestring: "+dueDateString+", mindate: "+new Date().toISOString().slice(0,10));
    const todayString = today.toISOString().slice(0,10);

    // Determine which map to add to based on whether the task is overdue
    const tasksMap = dueDateString < todayString ? overdueTasksByDate : 
    (dueDateString == todayString ? todaysTasksByDate : futureTasksByDate); 

    if (!tasksMap.has(dueDateString)) {
      tasksMap.set(dueDateString, []);
    }
    
    if(dueDateString == todayString){
        todaysTasks.push(item);
    }

    //Add the task to the array mapped to its due date.
    tasksMap.get(dueDateString).push(item);
  });
  
  //Sorts the Map keys (dates) so they will be displayed in ascending order
  const sortedOverdueDates = Array.from(overdueTasksByDate.keys()).sort();
  const sortedtodaysDates = Array.from(todaysTasksByDate.keys()).sort();
  const sortedFutureDates = Array.from(futureTasksByDate.keys()).sort();  

    //calculates the progress on the day's tasks, 
    //which is displayed on a circular progress indicator,
    const progress = React.useMemo(() => {
      //Use only today's tasks to calculate progress.
      const todayString = today.toISOString().slice(0,10);
      const totalTasks = todaysTasks.length + completedTasks.filter(task =>  
        task?.dueDate?.toISOString().slice(0,10) ==todayString).length;

      //Account for weightage
      var totalWeight = 0.0;
      var completedWeight = 0.0;
      //Multiply completion by weightage to find the total progress made
      completedTasks.filter(task =>  task?.dueDate?.toISOString().slice(0,10)
       == today.toISOString().slice(0,10)).forEach(task => {
        completedWeight += (task.weightage);
      });
      totalWeight+=completedWeight;
      todaysTasks.forEach(task => {
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
          //If the task is incremental, factor in its completion.
          completedWeight += (task.weightage*task.unitsComplete/task.targetUnits);
  
        }
      });
  
  
      //Calculate Progress by dividing the tasks complete by the total tasks, adjusting both for weightage
      console.log("Progress:");
      console.log("Completed(weighted): " + completedWeight);
      console.log("Total(weighted): " + totalWeight);
      setTotalWeight(totalWeight);
      //If any tasks exist, set the progress to the percentage complete, 
      //and if not, set it to 100%
      const completedPercentage = totalTasks > 0 ? 
      (completedWeight / (totalWeight)) * 100 : 100;
      
      return completedPercentage;
    }, [taskItems, completedTasks])

  {/*UI*/}
  return  (
      
    <View style={styles.container}>



      {/*Title*/}
      <Text style= {styles.titleWrapper}>{user ? "Hi "+user.values.first+"!" 
      : "Your Tasks: "}</Text>

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
          {(fill) => <Animated.Text style={styles.progressText}>
                        {`${Math.round(progress)}%`}
                      </Animated.Text>
          }
        </AnimatedCircularProgress>

        <View style={styles.taskWrapper}>  
            <View style={styles.items}>
              {/*This is where the tasks will go*/}
              {/*Iterate through sortedItems and display all tasks*/}
              {/* Tasks grouped by date */}

              {/* Overdue Tasks */}
              {sortedOverdueDates.map((dateString, index) => {
                const tasksForThisDate = overdueTasksByDate.get(dateString);
                try {
                  return renderTasksForDate("Overdue Tasks", tasksForThisDate, index, true, true);
                } catch (error) {
                  console.error("Error rendering task '"+tasksForThisDate.get(index)?.id+"': ", error);
                  return;
                }
              })}

          {/*Today's tasks header*/}
              <View style={styles.todaysTasksContainer}>
                <Text style={styles.mediumTitle}>Today's Tasks</Text>
                {/*Add task button*/}
                <TouchableOpacity onPress={() => handleSnapPress(2)}>
                    <View style={styles.addSheetOpenerWrapper}>
                        <Text style={styles.addSheetOpenerText}>Add</Text>
                    </View>
                </TouchableOpacity>
              </View>
              {/*Message that appears if there are no remaining tasks*/}
              {sortedtodaysDates.length === 0 ? (
                <Text style={styles.smallMessage}>
                You've completed all of your tasks today!
                </Text>
              ) : null}

              {/* Today's Tasks */}
              {sortedtodaysDates.map((dateString, index) => {
                const tasksForThisDate = todaysTasksByDate.get(dateString);
                // Format the date string as MM/DD/YYYY
                const formattedDateString = new Date(dateString)
                .toLocaleDateString();

                return renderTasksForDate(formattedDateString, 
                tasksForThisDate, index, false, true);
              })}

              {(futureTasksByDate.size>0)&&(<><Text style={styles.mediumTitle}>Upcoming Tasks</Text></>)}

              {/* Future Tasks */}
              {sortedFutureDates.map((dateString, index) => {
                const tasksForThisDate = futureTasksByDate.get(dateString);
                // Format the date string as MM/DD/YYYY
                const formattedDateString = new Date(dateString)
                .toLocaleDateString(); 

                return renderTasksForDate(formattedDateString, 
                  tasksForThisDate, index, true, false);
              })}

            {/* Completed Tasks */}
            {completedTasks.length === 0 ? null : (
              <Text style={styles.mediumTitle} paddingTop={15} paddingBottom={30}>Completed</Text>
            )}

            {/* Iterate through completedTasks and display all tasks */}
            {/*If the task exists, render it.*/}
            {completedTasks.map((item, index) => (
              (item)&&(<TouchableOpacity key={index} onPress={null} 
              onLongPress={() => handleDelete(item.id)}>
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
                  active={true}
                />
              </TouchableOpacity>)
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign out</Text>
          </TouchableOpacity>
        </View>


      </ScrollView>

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
            <ScrollView>
              <Text style={styles.mediumTitle}>Add Task</Text>
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
                      placeholderTextColor= {'#FFF'}
                      value={task}
                      width={'80%'}
                      onChangeText={text => setTask(text)}
                      keyboardAppearance= {'dark'}
                      />
                      <TouchableOpacity onPress={() => handleAddTask()}>
                          <Ionicons name="ios-add-circle" color={'#301087'} size={62}/>
                      </TouchableOpacity>
                    </View>
                
                    <View style={styles.roundedBox}>
                      {/*Priority picker, each priority corresponds to a numerical 
                      value that is used to sort the tasks when displayed*/}
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

                    {/*Metric type toggle*/}
                    <View style={styles.addTaskMenuRow}>
                      <Text style={styles.addTaskSubheading}>Metric Type:</Text>
                      {metricType === "boolean" && (

                        <><TouchableOpacity
                      style={[                                                         
                        styles.metricTypeBubble,
                        metricType === 'boolean' ? styles.metricTypeBubbleSelected : {},
                      ]}
                      onPress={() => { setMetricType("boolean"); } }>
                      <Text style={styles.selectedButtonText} 
                      color={(metricType == "boolean") 
                      ? "#D6C7A1" : "#FFF"}>True/False</Text>
                    </TouchableOpacity><TouchableOpacity
                      style={[
                        styles.metricTypeBubble,
                        metricType === 'incremental' ? styles.metricTypeBubbleSelected : {},
                      ]}
                      onPress={() => { setMetricType("incremental"); } }>
                        <Text style={styles.buttonText}>Incremental</Text>
                      </TouchableOpacity></>
                      )}

                      {/*If the metric type is incremental, let user select amount and units*/}
                      {metricType === "incremental" && (

                      <><TouchableOpacity
                      style={[
                      styles.metricTypeBubble,
                      metricType === 'boolean' ? styles.metricTypeBubbleSelected : {},
                      ]}
                      onPress={() => { setMetricType("boolean"); } }>
                      <Text style={styles.buttonText} 
                      color={(metricType == "boolean") ? "#D6C7A1" : "#FFF"}>
                        True/False</Text>
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
                      
                      {/*If the metric type is incremental, the 
                      user will be able to set the amount and type of units.*/}
                      {metricType === "incremental" && (
                        <>
                          <View style={styles.roundedBox}>

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
                              maxWidth={'32%'}
                              placeholder="Units"
                              placeholderTextColor= {'#FFF'}
                              onChangeText={(text) => setUnits(text)}
                              value={units}
                              keyboardAppearance= {'dark'}
                            />
                          </View>
                        </>
                      )}



                      <View style={styles.roundedBox}>
                        {/*Weightage picker*/}
                        <Text style={styles.addTaskSubheading}>Weightage: </Text>
                        <RNPickerSelect
                          style={pickerSelectStyles}
                          value={weightage}
                          onValueChange={(value) => setWeightage(value)}
                          items={[{ label: '1 (Lowest)', value: 1},
                          { label: '2', value: 2 },
                          { label: '3', value: 3 },
                          { label: '5', value: 5 },
                          { label: '8', value: 8 },
                          { label: '13', value: 13 },
                          { label: '21', value: 21 },
                          { label: '34 (Highest)', value: 34 }]}

                          placeholder={{ label: 'Select', value: null }}
                        />
                      </View>
                    
                    </View>
                  

                    {/*Calendar for due date*/}
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

//Export TaskScreen
export default TasksScreen;
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
    fontSize: 42,
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
    marginBottom: 20,
  },

  mediumTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFF',
  },

  overdueTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FF0000',
    marginBottom: 20,
  },

  items: {
    marginTop: 20,
  },

  writeTaskWrapper: {
    width: '100%',
    justifyContent: 'flex-start', // Change to 'flex-start'
    alignItems: 'center',
  },
  

  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 60,
    borderColor: '#FFF',
    borderWidth: 1,
    width: 280,
    marginRight: 15,
    color: '#FFA25B', 
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

  
  addSheetOpenerWrapper: {
    width: 100,
    height: 42,
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
    fontSize: 26,
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
    marginBottom: 20,
  },

  roundedBox: {
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

//Styles for picker
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