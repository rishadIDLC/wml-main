import {create} from 'zustand';

const initialState = {
    isLoading: false,
    focusOn: "",
    errorMessage: ""
}

const utilityStore = create(set => ({
    ...initialState,
    setIsLoading: (data) => set(() => ({isLoading: data})),
}));

export default utilityStore;
