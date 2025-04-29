import { Image, StyleSheet, Platform, Text, TextInput, View, TouchableOpacity, FlatList, Button, ScrollView, Alert, ToastAndroid} from 'react-native';
import twc from 'twrnc'

import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Entypo, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function TabTwoScreen() {
  const [pray, setPray] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<string>('');

  const [list, setList] = useState<[]>([]);
  const [filter, setFilter] = useState<string>('All'); 

  const [edit, setEdit] = useState(false);
  const [editID, setEditID] = useState(null);

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      const timeString = now.toLocaleTimeString('en-US', options);
      setCurrentTime(timeString);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addPrayer = () => {
    if( pray.trim() === '' || time.trim() === '' || category.trim() === '') {
      Alert.alert('Cannot Be Empty', '', [{ text: 'Try Again' }])
      return;
    }

    if( pray.trim().length < 3 ) {
      Alert.alert('Prayer Name', 'Min 3. Characters', [{ text: 'Try Again' }])
      return;
    }
      
    const Prayer = {
      id: Date.now().toString(),
      title: pray.trim(),
      time: time.trim(),
      category: category.trim()
    };

    setList([...list, Prayer]);
    ToastAndroid.show('Prayer Added', ToastAndroid.SHORT)
  
    setPray('');
    setTime('');
    setCategory('');
    setShowInputs(false);
  }

  const savePrayer = async () => {
    try {
      await AsyncStorage.setItem('prayer', JSON.stringify(list));
      console.log('Prayer Saved');

    } catch (error) {
      console.log('Error', error)
    }
  };

  const loadPrayer = async () => {
    try {
      const saved = await AsyncStorage.getItem('prayer');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        setList(parsed);
      }
    } catch (error) {
      console.log('Load Error', error);
    }
  };

  const deletePrayer = (id:string) => {
    const deleted = list.filter(item => item.id !== id);
    
    Alert.alert(
      "Are You Sure?",
      "Prayer that is deleted CANNOT be restored",
      [
        {
          text: "Cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            setList(deleted);
            ToastAndroid.show('Deleted Prayer', ToastAndroid.SHORT);
            setShowOptions(false);
          }
        },
      ]
    );
  }

  useEffect(() => {
    loadPrayer();
  }, []);

  useEffect(() => {
    savePrayer();
  }, [list]);


  const handleEdit = () => {
    let prevPray = pray.trim();
    let prevTime = time.trim();
    let prevCategory = category.trim();

    const edited = list.find(item => item.id === editID);

    const prevPrayChanged = prevPray !== edited?.title;
    const prevTimeChanged = prevTime !== edited?.time;
    const prevCategoryChanged = prevCategory !== edited?.time;

    if (prevPrayChanged || prevTimeChanged || prevCategoryChanged) {
      const updated = list.map(item => 
        item.id === editID 
          ? { ...item, title: prevPray, time: prevTime, category: prevCategory } 
          : item
      );
      
      Alert.alert(
        "Are You Sure?",
        'Changes CAN BE change in the future',
        [
          {
            text: "Cancel"
          },
          {
            text: "Confirm",
            onPress: () => {
            setList(updated);
            ToastAndroid.show('Prayer Updated', ToastAndroid.SHORT)
          }
          },
        ]
      );
    } else {
      console.log('No changes detected');
    }
    
    setPray('');
    setTime('');
    setCategory('');

    setEdit(false);
    setEditID(null);

    setShowInputs(false);
  }

  const startEdit = (item:any) => {
    setPray(item.title);
    setTime(item.time);
    setCategory(item.category);

    setEdit(true);
    setEditID(item.id);

    setShowOptions('');
    setShowInputs(true);
  }

  const [state, setState] = useState<{ [key: string]: boolean }>({});
  const [color, setColor] = useState<{ [key: string]: string }>({});
  const [showOptions, setShowOptions] = useState<{ [key: string]: boolean }>({});
  const [showInputs, setShowInputs] = useState();

  const toggleState = (id: string) => {
    setState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  
    setColor(prev => ({
      ...prev,
      [id]: prev[id] === '[#D9B374]' ? 'none' : '[#D9B374]',
    }));
  };

  const toggleOptions = (id: string) => {
    setShowOptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleInputs = () => {
    setShowInputs(!showInputs)

    setPray('');
    setTime('');
    setCategory('');

    setEdit(false);
    setEditID(null);
  }

  const filtered = list.filter(item => {
    if (filter === 'All') return true;
    return item.category === filter
  })
  

  return (
    <View style={twc`relative h-full bg-[#132F2E]`}>

      <TouchableOpacity style={twc`absolute bottom-10 right-10 z-999 bg-[#D9B374] p-1 rounded-lg`} onPress={toggleInputs}>
        <MaterialIcons name='add-alert' size={40} style={twc`text-white`}/>
      </TouchableOpacity>

      {showInputs && (
         <TouchableOpacity style={twc`absolute z-998 bg-black/40 h-full`} onPress={toggleInputs}>

          <View style={twc`gap-3 px-7 py-12 z-999 top-[35%] bg-[#173939] mx-5 roundedmd`}>
         <View style={twc`w-full gap-2`}>
           <TextInput value={pray} onChangeText={setPray} placeholder='Prayer Name' placeholderTextColor="rgb(110, 110, 110)" style={twc`border border-[#d5d5d5] px-4 w-full bg-gray-100 rounded-md`}/>
           <View style={twc`flex-row items-center justify-between`}>
             <TextInput value={time} onChangeText={setTime} placeholder='Prayer Time' placeholderTextColor="rgb(110, 110, 110)" style={twc`border border-[#d5d5d5] px-4 w-80% bg-gray-100 rounded-md`}/>
             <View style={twc`w-18% h-10 items-center justify-center rounded-md bg-[#D9B374]`}>
               <AntDesign name="clockcircleo" size={25} style={twc`text-white`}/>
             </View>
           </View>
           <View
             style={{
               borderWidth: 1,
               borderColor: '#d5d5d5',
               paddingHorizontal: 8,
               backgroundColor: '#f3f4f6',
               borderRadius: 8,
               height: 48,
               justifyContent: 'center',
             }}
           >
             <Picker
               selectedValue={category}
               onValueChange={(item) => setCategory(item)}
               dropdownIconColor="black"
               style={{
                 color: 'black',
               }}
             >
               <Picker.Item label="Select an option..." value="" />
               <Picker.Item label="Wajib" value="Wajib" />
               <Picker.Item label="Sunnah" value="Sunnah" />
             </Picker>
           </View>
         </View>

         <TouchableOpacity onPress={edit ? handleEdit : addPrayer} style={twc`bg-${edit ? '[#314C1C]' : '[#D9B374]'} py-2 rounded-md`} disabled={ pray === '' && time === '' }>
           <Text style={twc`text-center text-base text-base font-bold text-white ${ pray === '' && time === '' ? 'opacity-50' : ''}`}>{edit ? 'Update Tugas' : 'Tambah Tugas'}</Text>
         </TouchableOpacity>
       </View>
         </TouchableOpacity>
      )}

      <SafeAreaView style={twc`relative`}>
          <View style={twc`px-5 mt-4 gap-3`}>
            <View style={twc`bg-[#1C4545] rounded-lg py-7 gap-3`}>
              <Text style={twc`text-center text-white text-lg font-bold`}>Mon, 11 August</Text>
              <Text style={twc`text-center text-white text-4xl font-bold`}>{currentTime}</Text>
              <Text style={twc`text-center text-white text-lg font-bold`}>Berlin, Germany</Text>
            </View>

            <View style={twc`flex-row items-center justify-between`}>
              <TouchableOpacity style={twc`bg-[${filter === 'All' ? '#A68959' : '#D9B374'}] py-2 w-[30%] rounded`} onPress={() => setFilter('All')}>
                <Text style={twc`text-base text-white font-bold text-center`}>All</Text>
              </TouchableOpacity>

              <TouchableOpacity style={twc`bg-[${filter === 'Wajib' ? '#A68959' : '#D9B374'}] py-2 w-[30%] rounded`} onPress={() => setFilter('Wajib')}>
                <Text style={twc`text-base text-white font-bold text-center`}>Wajib</Text>
              </TouchableOpacity>

              <TouchableOpacity style={twc`bg-[${filter === 'Sunnah' ? '#A68959' : '#D9B374'}] py-2 w-[30%] rounded`} onPress={() => setFilter('Sunnah')}>
                <Text style={twc`text-base text-white font-bold text-center`}>Sunnah</Text>
              </TouchableOpacity>
            </View>

            <View style={twc`px-6 py-6 bg-[#173939] rounded-lg relative`}>
              <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                scrollEnabled
                renderItem={({item}) => (

                  <TouchableOpacity style={twc`flex-row items-center justify-between border-b border-black/10 py-4`} onPress={() => toggleState(item.id)}>
                    <TouchableOpacity style={twc`w-5 h-5 border border-[#D9B374] bg-${color[item.id]} rounded items-center justify-center`} onPress={() => toggleState(item.id)}>
                      <AntDesign name='check' size={12} style={twc`text-${state[item.id] ? 'black' : '[#173939]'}`}/>
                    </TouchableOpacity>

                    <View style={twc`flex-row items-center justify-between w-[75%]`}>
                      <Text style={twc`text-white font-medium`}>{item.title}</Text>
                      <Text style={twc`text-white`}>{item.time}</Text>
                      <Text style={twc`text-white`}>{item.category}</Text>
                    </View>
 

                    <TouchableOpacity onPress={() => toggleOptions(item.id)}>
                      <Entypo name='dots-three-vertical' size={20} style={twc`text-white`}/>
                    </TouchableOpacity>

                    {showOptions[item.id] && (
                      <TouchableOpacity style={twc`flex-row items-center justify-center gap-2 mt-2 absolute w-[92%] bg-[#173939]`} onPress={() => toggleOptions(item.id)}>
                        <TouchableOpacity onPress={() => startEdit(item)} style={twc`bg-[#032A4E] w-10 h-10 items-center justify-center rounded-lg`}>
                          <FontAwesome5 name='pen' style={twc`text-white`} size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deletePrayer(item.id)} style={twc`bg-[#8B1A10] w-10 h-10 items-center justify-center rounded-lg`}>
                          <FontAwesome5 name='trash-alt' style={twc`text-white`} size={18} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )}
                    
                  </TouchableOpacity>

                )}

                ListEmptyComponent={
                  <View style={twc`my-5`}>
                    <Text style={twc`text-gray-500 text-base font-medium text-center`}>NO PRAYER</Text>
                  </View>
                }
              />
            </View>
          </View>
      </SafeAreaView>
    </View>
  );
}
