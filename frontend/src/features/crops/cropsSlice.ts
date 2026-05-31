import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CropsState {
  isReservationModalOpen: boolean;
  selectedCropId: number | null;
  isStageUpdateModalOpen: boolean;
  isAddTrackingModalOpen: boolean;
}

const initialState: CropsState = {
  isReservationModalOpen: false,
  selectedCropId: null,
  isStageUpdateModalOpen: false,
  isAddTrackingModalOpen: false,
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
    openAddTrackingModal: (state) => {
      state.isAddTrackingModalOpen = true;
    },
    closeAddTrackingModal: (state) => {
      state.isAddTrackingModalOpen = false;
    },
  },
});

export const {
  openReservationModal,
  closeReservationModal,
  openStageUpdateModal,
  closeStageUpdateModal,
  openAddTrackingModal,
  closeAddTrackingModal,
} = cropsSlice.actions;

export default cropsSlice.reducer;
