import React, { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import WideButton from "./WideButton";

const FloatingButton: React.FC<{
  visible: boolean;
  onPress: () => void;
}> = ({ visible, onPress }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  // optional: control pointer events
  const [render, setRender] = useState(visible);

  useEffect(() => {
    if (visible) setRender(true);

    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) setRender(false); // hide after fade out
    });
  }, [visible]);

  if (!render) return null;

  return (
    <Animated.View
      style={{
        opacity,
        position: "absolute",
        bottom: 40,
        left: 24,
        right: 24,
      }}
    >
      <WideButton text="חזרה להיום" onClick={onPress} />
    </Animated.View>
  );
};

export default FloatingButton;
