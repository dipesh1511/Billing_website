export const saveOffline = (key, data) => {
  const old = JSON.parse(localStorage.getItem(key)) || [];
  old.push(data);
  localStorage.setItem(key, JSON.stringify(old));
};

export const getOffline = (key) => {
  return JSON.parse(localStorage.getItem(key)) || [];
};

export const clearOffline = (key) => {
  localStorage.removeItem(key);
};