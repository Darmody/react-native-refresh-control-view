/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { RefreshControlProps, ScrollView } from 'react-native-customizable-refresh-control-view';

interface Props {}
interface State {}

const REFRESH_DISTANCE = 100;

export default class App extends Component<Props, State> {
  public state = {};

  public render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          RefreshControl={this.renderRefreshControl}
          onPullRefresh={this.handlePullRefresh}
          minRefreshDistance={REFRESH_DISTANCE}
        >
          {this.renderItem(1)}
          {this.renderItem(2)}
          {this.renderItem(3)}
          {this.renderItem(4)}
          {this.renderItem(5)}
          {this.renderItem(6)}
          {this.renderItem(7)}
          {this.renderItem(8)}
          {this.renderItem(9)}
          {this.renderItem(10)}
          {this.renderItem(11)}
          {this.renderItem(12)}
        </ScrollView>
      </SafeAreaView>
    );
  }

  private renderRefreshControl = ({
    isRefreshing,
    canRefresh
  }: RefreshControlProps) => {
    return (
      <View style={styles.refreshControlContainer}>
        <View style={styles.refreshControl}>
          <Text>{this.renderHint(isRefreshing, canRefresh)}</Text>
        </View>
      </View>
    );
  }

  private renderHint = (isRefreshing: boolean, canRefresh: boolean) => {
    if (!canRefresh) {
      return 'pull to refresh';
    }

    if (!isRefreshing) {
      return 'release to refresh';
    }

    return 'refreshing...';
  }

  private renderItem = (index: number) => (
    <View style={styles.item}>
      <Text style={styles.text}> Item {index} </Text>
    </View>
  )

  private handlePullRefresh = () => {
    console.log('on pull refresh');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  item: {
    height: 100,
    width: 375,
    padding: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2'
  },
  text: {
    textAlign: 'center',
    fontSize: 20
  },
  refreshControl: {
    backgroundColor: 'blue',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: REFRESH_DISTANCE
  },
  refreshControlContainer: {
    backgroundColor: 'red',
    flex: 1,
    justifyContent: 'flex-start'
  }
});
