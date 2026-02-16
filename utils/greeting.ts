export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "בוקר טוב";
  } else if (hour >= 12 && hour < 18) {
    return "צהריים טובים";
  } else {
    return "ערב טוב";
  }
};