import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Pressable, ScrollView, useWindowDimensions, Modal } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function App() {
  return (
    <View style={styles.appContainer}>
      <MainPage />
    </View>
  );
}

function MainPage() {
  const [settingsVisible, setSettingsVisible] = useState(false)

  const handleSettingsVisible = () => {
    setSettingsVisible(false)
  }

  return (
    <View>
      <Settings visible={settingsVisible} handleChange={handleSettingsVisible} />
      <View style={styles.main}>

        <View style={{ flexDirection: "row", justifyContent: 'space-between', marginBottom: 20, flex: 1 }}>
          <View style={{ width: 24, marginLeft: 10 }} />
          <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>App Name</Text>
{   /*       <Pressable
            onPress={() => setSettingsVisible(true)}
>*/}
            <Ionicons name="settings-sharp" size={24} color="black" style={{ margin: 10 }} />
{/*</Pressable>*/}
        </View>
        <View style={{ flex: 10 }}>
          <ImageController />
        </View>
        <Text style={{ textAlign: "center", color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 30, flex: 2 }}>Username</Text>
      </View>
    </View>
  )
}

function Settings(props) {

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={props.visible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
    >
      <View style={{ textAlign: 'center', color: 'white' }}>
        <Text style={{ fontSize: 30, fontWeight: 'bold' }} >Settings</Text>
        <Pressable
          onPress={() => props.handleChange(false)}
        >
          <Text>Confirm</Text>
        </Pressable>
      </View>
    </Modal>
  )

}


function ImageController() {
  const [titleNum, setTitleNum] = useState(0)
  const [imgTitleState, setImgTitleState] = useState(imgTitle[0])

  useEffect(() => { console.log(titleNum) }, [])

  const handleButtonPress = (direction) => {
    if (direction === "right") {
      titleNum === 2 ? setTitleNum(0) : setTitleNum(titleNum + 1)
    }
    else {
      titleNum === 0 ? setTitleNum(2) : setTitleNum(titleNum - 1)
    }
    setImgTitleState(imgTitle[titleNum])
  }

  const scrollTitleChange = (number) => {
    setImgTitleState(imgTitle[number])
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: "space-between" }} >
        <Pressable
          onPress={() => handleButtonPress("left")
          }
        >
          <PrevBtn />
        </Pressable>
        <Text style={{ color: 'white', fontSize: 24, alignItems: 'center' }}>{imgTitleState}</Text>
        <Pressable
          onPress={() => handleButtonPress("right")
          }
        >
          <NextBtn />
        </Pressable>
      </View>
      <MainImage imageNum={titleNum} title={scrollTitleChange} imageTitle={imgTitleState} />
    </View>

  )
}

function PrevBtn() {
  return (
    <View style={{ marginVertical: 0, marginHorizontal: 20 }}>
      <Text style={{ marginVertical: 0, color: 'white' }}>Prev</Text>
      <AntDesign name="caretleft" size={24} color="white" />
    </View>
  )
}

function NextBtn() {
  return (
    <View style={{ marginVertical: 0, marginHorizontal: 20 }}>
      <Text style={{ marginVertical: 0, color: 'white' }}>Next</Text>
      <AntDesign name="caretright" size={24} color="white" />
    </View>
  )
}

function MainImage(props) {

  let imageNum = props.imageNum ? props.imageNum : 0
  let title = props.imageTitle
  const scrollRef = useRef()
  const [uriArray, setUriArray] = useState([]) //this array should eventually look for data from a database 
  const screen = useWindowDimensions()

  useEffect(() => {
    if (scrollRef.current != null) {
      scrollRef.current.scrollTo({ x: imageNum * screen.width })
    }

    async () => {
      try {
        const firstImageJson = await AsyncStorage.getItem(imgTitle[0])
        const secondImageJson = await AsyncStorage.getItem(imgTitle[1])
        const thirdImageJson = await AsyncStorage.getItem(imgTitle[2])
        const firstImage = firstImageJson != null ? JSON.parse(firstImageJson) : undefined
        const secondImage = secondImageJson != null ? JSON.parse(secondImageJson) : undefined
        const thirdImage = thirdImageJson != null ? JSON.parse(thirdImageJson) : undefined
        setUriArray([firstImage, secondImage, thirdImage])
      } catch (e) {
        // error reading value
      }
    }

  }, [imageNum])

  const handleScroll = (scrollNumber) => {
    let scrollNum = Math.round(scrollNumber.nativeEvent.contentOffset.x / screen.width);
    props.title(scrollNum)      //handleScroll is triggered anytime the ImgContainer moves. This logic prevents a loop from triggering when arrow buttons are used
  }

  const handleImage = async (key) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.cancelled) {
      let newImageArray = [...uriArray]
      newImageArray[key] = result.uri

      //store data item (string)
      async () => {
        try {
          const json = JSON.stringify(result.uri)
          await AsyncStorage.setItem([title], json)
        }

        catch (error) {
          console.log(error)
        }
      }
      setUriArray(newImageArray)
    }
  }

  return (
    <ScrollView
      horizontal
      pagingEnabled
      decelerationRate={'fast'}
      snapToOffsets={[screen.width, screen.width * 2]}
      ref={scrollRef}
      onScroll={handleScroll}
    >
      {
        imgTitle.map((imgTitle, key) => (
          <View key={key} style={[styles.imgContainer, { width: screen.width - 20, height: screen.height - screen.height / 2 }]} ref={() => 5}>
            <Pressable
              onPress={() => handleImage(key)}
            >
              {
                uriArray[key] === undefined ?
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="add-circle-sharp" size={48} color="black" />
                    <Text>{imgTitle}</Text>
                  </View>
                  :
                  <View>
                    <Image key={key} source={{ uri: uriArray[key] }} style={{ width: screen.width - 20, height: 300, borderRadius: 30 }} alt="main"></Image>
                  </View>
              }
            </Pressable>
          </View>
        ))
      }
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {

  },
  main: {
    backgroundColor: "black",
    color: "white",
    height: "100%"
  },
  imgContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
    color: 'black',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    height: '100%'
  }

});


let imgTitle = ['Photo ID', 'Vaccination Card', 'Covid Test']

