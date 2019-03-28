import React from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
  View
} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  ScrollView,
  State as GestureState
} from 'react-native-gesture-handler';

export interface RefreshControlProps {
  isRefreshing: boolean;
  canRefresh: boolean; // whether pulling distance enough for refreshing
  pullDistance: Animated.Value; // animated value represent for pulled distance
}

export interface RefreshControlScrollViewProps extends ScrollViewProps {
  minRefreshDistance: number; // 最小可刷新下拉距离
  onPullRefresh: () => void | Promise<void>; // 下拉刷新事件
  RefreshControl: React.ComponentType<RefreshControlProps>; // 下拉刷新控制组件
}

interface State {
  enable: boolean;
  isRefreshing: boolean;
  canRefresh: boolean;
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default class RefreshControlScrollView extends React.Component<
  RefreshControlScrollViewProps,
  State
> {
  public static defaultProps = {
    minRefreshDistance: 58
  };

  public state = {
    enable: true,
    pullDistance: new Animated.Value(0),
    isRefreshing: false,
    canRefresh: false
  };

  private gestureHandler = React.createRef<PanGestureHandler>();
  private scrolView = React.createRef<ScrollView>();

  private get isRefreshEnabled() {
    return this.state.enable && typeof this.props.onPullRefresh === 'function';
  }

  public render() {
    const { pullDistance, isRefreshing, canRefresh } = this.state;
    const {
      children,
      minRefreshDistance,
      RefreshControl,
      style,
      ...restProps
    } = this.props;

    return (
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Animated.View
          style={{
            height: pullDistance,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            overflow: 'hidden'
          }}
        >
          <RefreshControl
            canRefresh={canRefresh}
            isRefreshing={isRefreshing}
            pullDistance={pullDistance}
          />
        </Animated.View>
        <PanGestureHandler
          enabled={this.isRefreshEnabled && !isRefreshing}
          ref={this.gestureHandler}
          activeOffsetY={5}
          failOffsetY={-5}
          onGestureEvent={this.handlePullRefresh}
          onHandlerStateChange={this.handleGestureStateChange}
        >
          <AnimatedScrollView
            ref={this.scrolView}
            waitFor={
              this.isRefreshEnabled ? this.gestureHandler : this.scrolView
            }
            onScroll={this.handleScroll}
            onScrollEndDrag={this.handleScroll}
            onScrollStartDrag={this.handleScroll}
            onMomentumScrollEnd={this.handleScroll}
            scrollEventThrottle={50}
            style={[
              style,
              {
                marginTop: pullDistance
              }
            ]}
            {...restProps}
          >
            {children}
          </AnimatedScrollView>
        </PanGestureHandler>
      </View>
    );
  }

  private handleGestureStateFinish = (
    event: PanGestureHandlerStateChangeEvent
  ) => {
    const FINISHED_STATES = [
      GestureState.END,
      GestureState.FAILED,
      GestureState.CANCELLED
    ];
    const isFinished = !!FINISHED_STATES.find(
      state => state === event.nativeEvent.state
    );

    if (!isFinished) {
      return;
    }

    const { minRefreshDistance } = this.props;
    const refreshable =
      event.nativeEvent.translationY / 2 >= minRefreshDistance;

    if (refreshable) {
      this.startPullRefresh();
    } else {
      this.setState({ canRefresh: false });
      Animated.spring(this.state.pullDistance, {
        toValue: 0
      }).start();
    }
  }

  private handlePullRefreshFinish = () => {
    this.setState({ isRefreshing: false, canRefresh: false }, () => {
      Animated.spring(this.state.pullDistance, { toValue: 0 }).start();
    });
  }

  private startPullRefresh = () => {
    const { minRefreshDistance } = this.props;
    this.setState({ isRefreshing: true });

    Animated.spring(this.state.pullDistance, {
      toValue: minRefreshDistance,
      bounciness: 0,
      speed: 30
    }).start(async () => {
      if (!this.isRefreshEnabled) {
        this.handlePullRefreshFinish();
        return;
      }

      try {
        await this.props.onPullRefresh();
      } catch (error) {
        console.log('Pull Refresh Error:', error);
      }

      this.handlePullRefreshFinish();
    });
  }

  private handleGestureStateChange = (
    event: PanGestureHandlerStateChangeEvent
  ) => {
    this.handleGestureStateFinish(event);
  }

  private handlePullRefresh = (event: PanGestureHandlerGestureEvent) => {
    const { pullDistance, canRefresh } = this.state;
    const { minRefreshDistance } = this.props;
    const { translationY } = event.nativeEvent;

    const distance = translationY * 0.5;

    if (distance >= minRefreshDistance && !canRefresh) {
      this.setState({
        canRefresh: true
      });
    }

    if (distance < minRefreshDistance && canRefresh) {
      this.setState({
        canRefresh: false
      });
    }

    pullDistance.setValue(distance);
  }

  private handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { enable } = this.state;

    if (!this.isRefreshEnabled && enable) {
      this.setState({ enable: false });

      return;
    }

    const { nativeEvent } = event;
    // pull refresh
    if (nativeEvent.contentOffset.y <= 0 && !enable) {
      this.setState({ enable: true });
    }

    // scroll
    if (nativeEvent.contentOffset.y > 0 && enable) {
      this.setState({ enable: false });
    }
  }
}
