import { View } from "react-native";
import { getNormalizedProgress } from "@utils/startDate"

export default function ProgressBar() {
  
  const normalizedProgress = getNormalizedProgress()  

  return (
    <View className="w-full h-3 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
      <View className="h-full bg-primary rounded-full" style={{ width: `${normalizedProgress}%`, overflow: 'hidden' }}>
        <View className="absolute top-[2.5px] left-[5px] rounded-full bg-white/30 h-1 w-32" />
      </View>
    </View>

  )
}
