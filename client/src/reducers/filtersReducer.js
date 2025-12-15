export const initialFilters = {
  from: "",
  to: "",
  category: "all",
  type: "all",
  sort: "date_desc",
};

export function filtersReducer(state, action) {
  switch (action.type) {
    case "set_from":
      return { ...state, from: action.value };
    case "set_to":
      return { ...state, to: action.value };
    case "set_category":
      return { ...state, category: action.value };
    case "set_type":
      return { ...state, type: action.value };
    case "set_sort":
      return { ...state, sort: action.value };
    case "reset":
      return initialFilters;
    default:
      return state;
  }
}
