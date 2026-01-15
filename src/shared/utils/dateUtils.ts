export const formatDate = (date: Date): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}요일`;
};

export const getLunarDate = (date: Date): string => {
  try {
    const formatter = new Intl.DateTimeFormat('ko-KR-u-ca-chinese', {
      month: 'numeric',
      day: 'numeric',
    });
    // format returns something like "8월 10일"
    const lunarString = formatter.format(date);
    // Convert "8월 10일" to "8.10"
    return `음 ${lunarString.replace('월 ', '.').replace('일', '')}`;
  } catch (e) {
    return '';
  }
};
