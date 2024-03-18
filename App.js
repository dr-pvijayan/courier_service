import React, { useState, useEffect } from 'react';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import AppContainer from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import {
  StyleSheet,
  View,
  ImageBackground,
  Dimensions,
  LogBox
} from "react-native";
import { Provider } from "react-redux";
import {
  language
} from 'config';
import  {
  FirebaseProvider,
  store
} from 'common/src';
import AppCommon from './AppCommon';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    LogBox.ignoreLogs(['Setting a timer']);
    onLoad();
  }, []);

  const _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/ImagesBacup/background.jpg'),
        require('./assets/ImagesBacup/logo165x90white.png'),
        require('./assets/ImagesBacup/bg.jpg'),
        require('./assets/ImagesBacup/intro.jpg'),
      ]),
      Font.loadAsync({
        'Ubuntu-Bold': require('./assets/fonts/Ubuntu-Bold.ttf'),
        'Ubuntu-Regular': require('./assets/fonts/Ubuntu-Regular.ttf'),
        'Ubuntu-Medium': require('./assets/fonts/Ubuntu-Medium.ttf'),
        'Ubuntu-Light': require('./assets/fonts/Ubuntu-Light.ttf'),
      }),
    ]);
  };

  const onLoad = async () => {
    if (__DEV__) {
      setUpdateMsg(language.loading_assets);
      _loadResourcesAsync().then(() => {
        setAssetsLoaded(true);
      });
    } else {
      try {
        setUpdateMsg(language.checking_updates);
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setUpdateMsg(language.downloading_updates);
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        } else {
          setUpdateMsg(language.loading_assets);
          _loadResourcesAsync().then(() => {
            setAssetsLoaded(true);
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
  }


  return (
    assetsLoaded ?
      <Provider store={store}>
        <FirebaseProvider>
          <AppCommon>
            <AppContainer />
          </AppCommon>
        </FirebaseProvider>
      </Provider>
      :
      <View style={styles.container}>
        <ImageBackground
          source={require('./assets/ImagesBacup/intro.jpg')}
          resizeMode="stretch"
          style={styles.imagebg}
        >
        </ImageBackground>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center'
  },
  imagebg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: "flex-end",
    alignItems: 'center'
  }
});