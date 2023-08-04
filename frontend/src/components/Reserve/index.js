import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import './Reserve.css'
import { useRef } from 'react';
import { useModal } from "../../context/Modal";

export function Reserve() {
  const disabledDates = [["2023-08-22", "2023-08-25"], ["2023-08-10", "2023-08-12"]];

  const [startDate, setStartDate] = useState("");
  const [startDateFocused, setStartDateFocused] = useState(false);
  const [startDateEdited, setStartDateEdited] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [endDateFocused, setEndDateFocused] = useState(false);
  const [endDateEdited, setEndDateEdited] = useState(false);
  const [selectRange, setSelectRange] = useState(false);
  const [removeSelection, setRemoveSelection] = useState(false);
  const [range, setRange] = useState("");
  const [key, setKey] = useState(1);


  const useFocus = () => {
    const htmlElRef = useRef(null)
    const setFocus = () => { htmlElRef.current && htmlElRef.current.focus() }
    const setUnfocus = () => { htmlElRef.current && htmlElRef.current.blur() }
    return [htmlElRef, setFocus, setUnfocus]
  }

  const [inputRef, setInputFocus, setInputUnfocus] = useFocus()

  const isDateComplete = (dateStr) => {
    const [year, month, date] = dateStr.split("-");
    if (year && month && date && !year.startsWith("0")) {
      return true;
    }
    return false;
  }

  const dateToString = (dateObj) => {
    return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")}`
  }

  const changeDateFormat = (dateStr) => {
    return dateStr.split("-").join("/");
  }

  const findClosestStartDate = (date, dateArr) => {
    const startDates = dateArr.map(range => range[0]);
    let minTimeDiff = Infinity;
    let minTimeDiffInx;
    startDates.forEach((startDate, i) => {
      if (new Date(startDate) >= new Date(date) && new Date(startDate) - new Date(date) < minTimeDiff) {
        minTimeDiff = new Date(startDate) - new Date(date);
        minTimeDiffInx = i;
      }
    });
    return minTimeDiffInx !== undefined ? startDates[minTimeDiffInx] : null;
  }

  function onChange(newRange) {
    if (Array.isArray(newRange)) {
      setStartDate(dateToString(newRange[0]))
      setEndDate(dateToString(newRange[1]))
      setSelectRange(false)
    } else {
      setStartDate(dateToString(newRange))
      setEndDate("")
      setSelectRange(true)
    }
    setRange(newRange);
  }

  function tileDisabled({ date, view }) {
    if (view === 'month') {
      // if selecting start date
      if (!selectRange) {
        return disabledDates.find(([startDate, endDate]) => {
          return date < new Date(changeDateFormat(endDate)) && date > new Date(changeDateFormat(startDate))
        }) || date <= new Date();
        // if selecting end date
      } else {
        const closestStartDate = findClosestStartDate(startDate, disabledDates) ? changeDateFormat(findClosestStartDate(startDate, disabledDates)) : null
        return disabledDates.find(([startDate, endDate]) => {
          return date < new Date(changeDateFormat(endDate)) && date > new Date(changeDateFormat(startDate))
        }) || date <= new Date(changeDateFormat(startDate)) || (closestStartDate ? date > new Date(closestStartDate) : null);
      }

    }
  }

  useEffect(() => {
    if (removeSelection) {
      setRange("");
      setStartDate("");
      setSelectRange(false);
    }
    return setRemoveSelection(false)
  }, [removeSelection])

  return (
    <>
      <label htmlFor='startDate'>Start Date</label>
      <input
        name='startDate'
        type="date"
        className='dateField'
        value={startDate}
        onFocus={() => setStartDateFocused(true)}
        onBlur={(e) => {
          setStartDate(e.target.value);
          setStartDateFocused(false);
          setStartDateEdited(true);
        }}
        onChange={(e) => {
          if (isDateComplete(e.target.value)) {
            if (endDate && isDateComplete(endDate)) {
              setRange((prev) => {
                prev[0] = new Date(changeDateFormat(e.target.value))
                return prev
              })
            } else {
              setRange(new Date(changeDateFormat(e.target.value)))
              setSelectRange(true)
            }
          } else {
            setRange("");
            setKey((prev) => prev + 1)
          }
          setStartDate(e.target.value)
        }}
      />
      <label htmlFor='endDate'>End Date</label>
      <input
        name='endDate'
        type="date"
        className='dateField'
        value={endDate}
        onFocus={() => setEndDateFocused(true)}
        onBlur={(e) => {
          setEndDate(e.target.value);
          setEndDateFocused(false);
          setEndDateEdited(true);
        }}
        ref={inputRef}
        disabled={!isDateComplete(startDate)}
        onChange={(e) => {
          if (isDateComplete(e.target.value)) {
            setRange((prev) => {
              if (Array.isArray(prev)) {
                prev[1] = new Date(changeDateFormat(e.target.value))
                return prev
              } else {
                return [prev, new Date(changeDateFormat(e.target.value))]
              }
            })
            setSelectRange(false)
          } else {
            setRange((prev) => prev[0]);
            setSelectRange(true)
          }
          setEndDate(e.target.value)
        }}
      />
      <Calendar
        key={key}
        onChange={onChange}
        value={range}
        minDetail="year"
        tileDisabled={tileDisabled}
        selectRange={selectRange}
        onClickDay={(value, e) => {
          const startDates = disabledDates.map(range => new Date(changeDateFormat(range[0])).toDateString());
          if (!range) {
            setStartDate(dateToString(value))
            setEndDate("")
            setSelectRange(true)
          }
          if (!selectRange && startDates.includes(value.toDateString())) {
            setRemoveSelection(true)
          }
        }}
      />
    </>
  );
}
