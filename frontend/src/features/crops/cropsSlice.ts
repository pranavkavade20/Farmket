import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CropsState {
  isReservationModalOpen: boolean;
  selectedCropId: number | null;
  isStageUpdateModalOpen: boolean;
}

const initialState: CropsState = {
  isReservationModalOpen: false,
  selectedCropId: null,
  isStageUpdateModalOpen: false,
};

const cropsSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    openReservationModal: (state, action: PayloadAction<number>) => {
      state.selectedCropId = action.payload;
      state.isReservationModalOpen = true;
    },
    closeReservationModal: (state) => {
      state.isReservationModalOpen = false;
      state.selectedCropId = null;
    },
    openStageUpdateModal: (state, action: PayloadAction<number>) => {
      state.selectedCropId = action.payload;
      state.isStageUpdateModalOpen = true;
    },
    closeStageUpdateModal: (state) => {
      state.isStageUpdateModalOpen = false;
      state.selectedCropId = null;
    },
  },
});

export const {
  openReservationModal,
  closeReservationModal,
  openStageUpdateModal,
  closeStageUpdateModal,
} = cropsSlice.actions;

export default cropsSlice.reducer;
