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
} from "react-native";

import Task from "C:/Users/nikhi/apps/MilestoneV0000/components/Task";


import { AnimatedCircularProgress } from "react-native-circular-progress";


//Export
export default function App() {
  {/*Dimensions constants*/}
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  {/*BottomSheet Constants*/}
  const sheetRef = useRef(null);
  const [bottomSheetIsOpen, setBottomSheetIsOpen] = useState(true);
  const transparentHandleStyle = {
    backgroundColor: 'transparent',
  };
  const snapPoints = ["1%", "24%", "54%"];
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
    setBottomSheetIsOpen(true);
  }, [])
  const inputRef = useRef(null);


  {/*Task field setters*/}
  const [task, setTask] = useState(null);


  {/*Task arrays & progress*/}
  const [taskItems, setTaskItems] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  //const sortedTasks = taskItems.sort((a, b) => a.getPriority() - b.getPriority());
  const [progress, setProgress] = useState(0);

  {/*Method passed to each task to update screen when user increments/decrements units complete*/}

  const updateUnits = (taskId, newUnits) => {
    //change to sorted later
    setTasks(taskItems.map(task => {
        if (task.id === taskId) {
            return { ...task, unitsComplete: newUnits };
        }
        return task;
    }));
  };

  useEffect(() => {
    const calculateProgress = () => {
      const totalTasks = taskItems.length + completedTasks.length;
      const completedPercentage = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
      setProgress(completedPercentage);
    };
  
    calculateProgress();
  }, [taskItems, completedTasks]);

  function updateScreen(){
    setTaskItems(taskItems);
  }
  
  {/*Task functions*/}
  const handleAddTask = () => {
    Keyboard.dismiss();
    if (task) {
      const taskWithPriority = { text: task};
      setTaskItems([...taskItems, taskWithPriority]);
      {/*Reset all task fields and close BottomSheet*/}
      setTask(null);
      //setTaskPriority(null);
      //setUnits(null);      
      //setTargetUnits(null);
      //setMetricType(null);
      //setWeightage(null);
      inputRef.current.clear(); 
      handleSnapPress(0);
    
    {/*Notify user if they didn't fill out all fields*/}
    } else{
      alert("Please fill out all fields");
    }

  };
  
  const completeTask = (index) => {
    const itemsCopy = [...taskItems];
    const completedTask = itemsCopy.splice(index, 1);
    setCompletedTasks([...completedTasks, ...completedTask]);
    setTaskItems(itemsCopy);
  };
  


  const uncompleteTask = (index) => {
    const itemsCopy = [...completedTasks];
    const uncompletedTask = itemsCopy.splice(index, 1);
    setTaskItems([...taskItems, ...uncompletedTask]);
    setCompletedTasks(itemsCopy);
  }

  const removeTask = (index) => {
    const itemsCopy = [...taskItems];
    itemsCopy.splice(index, 1);
    setTaskItems(itemsCopy);
  }

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
            {taskItems.map((item, index) => {
              return (
                <TouchableOpacity key={index} onPress={() => completeTask(index)} onLongPress={() => removeTask(index)}>
                  <Task
                      key={item.id}
                      id={item.id}
                      text={item.text}
                  />
                </TouchableOpacity>
              );
            })}


            {completedTasks.length === 0 ? null : (
              <Text style={styles.sectionTitle} paddingTop = {15} paddingBottom={30}>Completed</Text>
            ) }
            {completedTasks.map((item, index) => {
              return (
                <TouchableOpacity key={index} onPress={() => uncompleteTask(index)} onLongPress={() => removeCompleteTask(index)}>
                  <Task text={item.text}  complete={true}/>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/*Write a task*/}

      {/*Bottom Sheet View*/}

            <Text style={styles.addTaskTitle}>Add Task</Text>
            <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.writeTaskWrapper}
            >
              <View style = {styles.addTaskContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder={'Write a task'}
                    value={task}
                    onChangeText={text => setTask(text)}
                    />
                    <TouchableOpacity onPress={() => handleAddTask()}>
                    <View style={styles.addWrapper}>
                        <Text style={styles.addText}>+</Text>
                    </View>
                    </TouchableOpacity>
                </View>
              </View>

            </KeyboardAvoidingView>

            




    </View>
    
  )}
//}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
  },

  titleWrapper: {
    paddingTop:15,
    paddingBottom:20,
    paddingHorizontal:20,
    backgroundColor: '#E8EAED',
    fontSize: 30,
    fontWeight: 'bold',

  },
  taskWrapper: {
    paddingTop: 33,
    paddingBottom: 230,
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
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
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
