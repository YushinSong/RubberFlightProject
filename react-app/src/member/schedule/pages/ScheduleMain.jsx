import React, { useContext, useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import Header from '../../../general/common/Header/Header';
import style from '../CSS/ScheduleMain.module.css';
import ScheduleItem from '../component/ScheduleItem';
import { LoginContext } from '../../../general/user/contexts/LoginContextProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Stack, Checkbox, IconButton, Input, Button } from '@chakra-ui/react';
import { AddIcon, CloseIcon, EditIcon, DeleteIcon, CheckIcon } from '@chakra-ui/icons';

const ScheduleMain = () => {
    const { userInfo } = useContext(LoginContext);
    const [schedules, setSchedules] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [checklistItems, setChecklistItems] = useState([]);
    const [selectedChecklistId, setSelectedChecklistId] = useState(null);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editItemName, setEditItemName] = useState("");
    const containerRef = useRef(null);
    const backUrl = process.env.REACT_APP_BACK_URL;
    const [emojiGroups] = useState([
        ["👔", "🛀"],   // 그룹 1
        ["💻", "💡"],   // 그룹 2
        ["🌭", "💊"]    // 그룹 3
    ]);
    const token = Cookies.get('accessToken');
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.backgroundColor = '#FFFFFF';
        document.body.style.overflowY = 'scroll';
    }, []);

    useEffect(() => {
        if (userInfo.id) {
            readAllChecklistsAndItems();
            readAllSchedule();
        }
    }, [userInfo]);

    const readAllSchedule = async () => {
        try {
            const response = await axios.get(`${backUrl}/schedule`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (Array.isArray(response.data)) {
                setSchedules(response.data);
            } else {
                console.error("Unexpected data format: ", response.data);
            }
        } catch (error) {
            console.error("Error fetching schedules: ", error);
        }
    };

    const readAllChecklistsAndItems = async () => {
        try {
            const checklistsResponse = await axios.get(`${backUrl}/checklist/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setChecklists(checklistsResponse.data);
    
            setChecklistItems([]);
    
            if (checklistsResponse.data.length > 0) {
                const checklistIds = checklistsResponse.data.map(checklist => checklist.id);
                const itemsPromises = checklistIds.map(checklistId =>
                    axios.get(`${backUrl}/checklist/items/${checklistId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                );
                const itemsResponses = await Promise.all(itemsPromises);
    
                const allItems = itemsResponses.flatMap(response => response.data);
                const itemsWithChecked = allItems.map(item => ({
                    ...item,
                    checked: item.checked !== undefined ? item.checked : false // Default value
                }));
                setChecklistItems(itemsWithChecked);
            }
        } catch (error) {
            console.error("Error fetching checklists and items: ", error);
        }
    };

    const handleCheckboxChange = async (itemId, checked, itemName, checklistId) => {
        const newCheckedStatus = !checked;
        const updatedItems = checklistItems.map(item => 
            item.id === itemId ? { ...item, checked: newCheckedStatus } : item
        );
        setChecklistItems(updatedItems); // Update UI immediately
    
        try {
            await updateChecklistItem(itemId, itemName, newCheckedStatus, checklistId);
        } catch (error) {
            console.error("Error updating checklist item: ", error);
            // Revert the checkbox change in case of error
            setChecklistItems(checklistItems); 
        }
    };

    const updateChecklistItem = async (itemId, itemName, checked, checklistId) => {
        try {
            const response = await axios.put(`${backUrl}/checklist/items/${itemId}`, {
                itemName,
                checked,
                checklistId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": 'application/json'
                }
            });
            // console.log("Server response:", response.data); // Server response for debugging
        } catch (error) {
            console.error("Error updating checklist item:", error.response ? error.response.data : error.message);
        }
    };

    const deleteChecklistItem = async (itemId) => {
        try {
            await axios.delete(`${backUrl}/checklist/items/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            readAllChecklistsAndItems();
        } catch (error) {
            console.error("Error deleting checklist item: ", error);
        }
    };

    const createNewSchedule = (e) => {
        e.preventDefault();
        const newSchedule = { title: "제목 없는 일정" };
        axios.post(`${backUrl}/schedule`, newSchedule, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": 'application/json' }
        })
        .then(response => {
            const { data } = response;
            navigate(`/schedule/edit/${data.id}`);
        });
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        const newItemName = e.target.elements.newItemName.value;
        if (!newItemName || !selectedChecklistId) return;
    
        try {
            await axios.post(`${backUrl}/checklist/items/create`, {
                checklistId: selectedChecklistId,
                itemName: newItemName,
                checked: false
            }, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": 'application/json' }
            });
            readAllChecklistsAndItems();
            setIsAddingItem(false); // Automatically close form
            setSelectedChecklistId(null);
        } catch (error) {
            console.error("Error adding checklist item: ", error);
        }
    };

    const handleAddIconClick = (checklistId) => {
        if (isAddingItem && selectedChecklistId === checklistId) {
            setIsAddingItem(false);
            setSelectedChecklistId(null);
        } else {
            setIsAddingItem(true);
            setSelectedChecklistId(checklistId);
            setEditingItemId(null); // Ensure editing input is closed
        }
    };

    const handleItemClick = (itemId) => {
        setSelectedItemId(itemId === selectedItemId ? null : itemId); // Toggle selection
    };

    const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
            setSelectedItemId(null); // Deselect if clicked outside
        }
    };

    const handleEditClick = (itemId, itemName) => {
        // console.log("Editing Item Clicked", itemId, itemName);
        // console.log("Current Editing Item ID", editingItemId);
        if (editingItemId === itemId) {
            setEditingItemId(null);
        } else {
            setEditingItemId(itemId);
            setEditItemName(itemName);
            setIsAddingItem(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (editingItemId && editItemName) {
            try {
                // Find the checklistId from the current checklistItems state
                const item = checklistItems.find(item => item.id === editingItemId);
                const checklistId = item ? item.checklistId : null; // Get the checklistId for the item
    
                // Pass checklistId to the updateChecklistItem function
                await updateChecklistItem(editingItemId, editItemName, false, checklistId);
                readAllChecklistsAndItems(); // Reload checklists and items after update
                setEditingItemId(null); // Reset editing state
                setEditItemName(""); // Clear input
            } catch (error) {
                console.error("Error updating checklist item: ", error);
            }
        }
    };

    const getEmojiForChecklist = (index) => {
        const groupIndex = Math.floor(index / emojiGroups[0].length); // 그룹 인덱스 계산
        const emojiIndex = index % emojiGroups[0].length; // 그룹 내 이모지 인덱스 계산
        return emojiGroups[groupIndex][emojiIndex];
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <>
            <Header isMain={false} />
            <div id={style.scheduleHeaderContainer}>
                <div id={style.headerImage}/>
                <div id={style.scheduleHeader}>일정과 체크리스트를 한번에 - </div>
                <div id={style.scheduleInfo}>
                    &nbsp;&nbsp;나만의 체크리스트를 만들어 놓치는 물건이 없나 확인해보세요.<br />
                    함께 여행하는 가족, 친구와 함께 일정을 짤 수도 있어요.
                </div>
            </div>
    
            <div id={style.contentPart} ref={containerRef}>
                {/* Checklist Part */}
                <div id={style.checklistPart}>
                    <div className={style.partTitle}>Checklist
                        <div className={style.resetIcon}></div>
                    </div>
                    <div id={style.checklistPartContainer}>
                        {checklists.length === 0 ? (
                            <div>체크리스트가 없습니다.</div>
                        ) : (
                            checklists.reduce((rows, checklist, index) => {
                                 if (index % Math.ceil(checklists.length / 2) === 0) rows.push([]); // 두 그룹으로 나누기
                                rows[rows.length - 1].push(checklist); // 현재 그룹에 체크리스트 추가
                                return rows;
                            }, []).map((row, rowIndex) => (
                                <div key={rowIndex} className={style.ListsColumn}>
                                    {row.map((checklist, checklistIndex) => (
                                        <div key={checklist.id} className={style.checkList}>
                                            <div className={style.emoji}>
                                                {getEmojiForChecklist(rowIndex * Math.ceil(checklists.length / 2) + checklistIndex)}
                                            </div>
                                            <div className={style.checkListTitleContainer}>
                                                <span className={style.checkListTitle}>{checklist.category}</span>
                                                <IconButton
                                                    aria-label={isAddingItem && selectedChecklistId === checklist.id ? "Close" : "Add"}
                                                    icon={isAddingItem && selectedChecklistId === checklist.id ? <CloseIcon /> : <AddIcon />}
                                                    size="xs"
                                                    onClick={() => handleAddIconClick(checklist.id)}
                                                    className={style.addIcon}
                                                />
                                            </div>
                                            {isAddingItem && selectedChecklistId === checklist.id && (
                                                <form onSubmit={handleAddItem} className={style.addItemForm}>
                                                    <Input
                                                        type="text"
                                                        name="newItemName"
                                                        placeholder="입력해주세요"
                                                        className={style.addItemInput}         
                                                    />
                                                    <IconButton
                                                        aria-label="Save item"
                                                        icon={<CheckIcon />}
                                                        type="submit"
                                                        size="xs"
                                                        className={style.saveButton}
                                                    />
                                                </form>
                                            )}
                                            <div className={style.checkListContent}>
                                            <Stack spacing={2} direction='column'>
                                                {checklistItems
                                                    .filter(item => item.checklistId === checklist.id)
                                                    .map(item => (
                                                        <div
                                                            key={item.id}
                                                            className={style.itemRow}
                                                            onClick={() => handleItemClick(item.id)}
                                                        >
                                                            <Checkbox
                                                                size='lg'
                                                                isChecked={item.checked}
                                                                onChange={(e) => handleCheckboxChange(item.id, item.checked, item.itemName, checklist.id)}
                                                                colorScheme='blue'
                                                                className={style.checkbox}
                                                            />
                                                            {editingItemId === item.id ? (
                                                                <form onSubmit={handleEditSubmit} className={style.editItemForm}>
                                                                    <Input
                                                                        type="text"
                                                                        value={editItemName}
                                                                        onChange={(e) => setEditItemName(e.target.value)}
                                                                        placeholder="수정해주세요"
                                                                        className={style.editItemInput}
                                                                    />
                                                                    <IconButton
                                                                        aria-label="Save item"
                                                                        icon={<CheckIcon />}
                                                                        type="submit"
                                                                        size="xs"
                                                                        className={style.edditButton}
                                                                    />
                                                                </form>
                                                            ) : (
                                                                <>
                                                                    <span
                                                                        className={`${style.itemName} ${item.checked ? style.checkedItem : ''}`}
                                                                        onClick={(e) => { e.stopPropagation(); handleItemClick(item.id); }}
                                                                    >
                                                                        {item.itemName}
                                                                    </span>
                                                                    {selectedItemId === item.id && (
                                                                        <div className={style.editDeleteButtons}>
                                                                            <IconButton
                                                                                aria-label="Edit item"
                                                                                icon={<EditIcon />}
                                                                                size="xs"
                                                                                variant="ghost"
                                                                                colorScheme="blue"
                                                                                className={style.editButton}
                                                                                onClick={(e) => {e.stopPropagation(); handleEditClick(item.id, item.itemName); }}
                                                                            />
                                                                            <IconButton
                                                                                aria-label="Delete item"
                                                                                icon={<DeleteIcon />}
                                                                                size="xs"
                                                                                variant="ghost"
                                                                                colorScheme="red"
                                                                                className={style.deleteButton}
                                                                                onClick={(e) => { e.stopPropagation(); deleteChecklistItem(item.id); }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    ))
                                                }
                                            </Stack>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                        <div className={style.bottomContainer}></div>
                    </div>
                    <div className={style.bottomFooter}></div>
                </div>
    
                {/* Schedule Part */}
                <div id={style.schedulePart}>
                    <div className={style.partTitle}>Schedule</div>
                    <div id={style.schedulePartContainer}>
                        <div id={style.addPart}>
                            <div id={style.addButton} onClick={createNewSchedule}>
                                <div id={style.addIcon} />
                            </div>
                        </div>
                        <div id={style.listPart}>
                            {schedules.length === 0 ? (
                                <div style={{ color: '#546280', fontSize: '25px' }}>작성한 일정이 없습니다.</div>
                            ) : (
                                <>
                                    <div id={style.listHeader}>최근 일정 목록</div>
                                    <div id={style.listsContainer}>
                                        {schedules.map(schedule => (
                                            <ScheduleItem
                                                key={schedule.id}
                                                schedule={schedule}
                                                readAllSchedule={readAllSchedule}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    
            <div id={style.footerPart}></div>
        </>
    );
    
};

export default ScheduleMain;
