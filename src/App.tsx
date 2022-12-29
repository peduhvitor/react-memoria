import { useEffect, useState } from 'react';
import * as C from './App.styles'

import logoImage from './assets/devmemory_logo.png';
import RestartIcon from './svgs/restart.svg';

import { Button } from './components/Button';
import { InfoItem } from './components/InfoItem';
import { GridItemType } from './types/GridItemType';

import { GridItem } from './components/GridItem';
import { items } from './data/items';
import { formatTimeElapsed } from './helpers/formatTimeElapsed';


const App = () => {

    const [playing, setPlaying] = useState<boolean>(false);
    const [timeElapsed, setTimeElapsed] = useState<number>(0);
    const [moveCount, setMoveCount] = useState<number>(0);
    const [showCount, setShowCount] = useState<number>(0);
    const [gridItems, setGridItems] = useState<GridItemType[]>([]);


    useEffect(() => resetAndCreateGrid(), []);

    const resetAndCreateGrid = () => {
        // passo 1 - resetar o jogo

        setTimeElapsed(0);
        setMoveCount(0);
        setShowCount(0);


        // passo 2 - criar o grid e começar o jogo
        // 2.1 - criar um grid vazio

        let tmpGrid: GridItemType[] = [];

        for (let i = 0; i < (items.length * 2); i++) {
            tmpGrid.push({
                item: null, shown: false, permanentShown: false
            })
        }

        // 2.2 - preencher grid

        for (let w = 0; w < 2; w++) {
            for (let i = 0; i < items.length; i++) {
                let pos = -1;

                while (pos < 0 || tmpGrid[pos].item !== null) {
                    pos = Math.floor(Math.random() * (items.length * 2));
                }

                tmpGrid[pos].item = i;
            }
        }

        // 2.3 - jogar no state

        setGridItems(tmpGrid)


        // passo 3 - começar o jogo

        setPlaying(true);

    }

    useEffect(() => {
        const timer = setInterval(() => {
            if (playing) {
                setTimeElapsed(timeElapsed + 1)
            }
        }, 1000);
        return () => clearInterval(timer)
    }, [playing, timeElapsed])


    const handleItemClick = (index: number) => {
        if (playing && index !== null && showCount < 2) {
            let tmpGrid = [...gridItems];

            if (tmpGrid[index].permanentShown === false && tmpGrid[index].shown === false) {
                tmpGrid[index].shown = true;
                setShowCount(showCount + 1);
            }

            setGridItems(tmpGrid)
        }
    }


    // Verifica se os cards abertos são iguais

    useEffect(() => {
        if (showCount === 2) {
            const opened = gridItems.filter(item => item.shown === true);

            if (opened.length === 2) {
                if (opened[0].item === opened[1].item) {
                    let tmpGrid = [...gridItems];
                    tmpGrid.forEach(item => {
                        if (item.shown) {
                            item.permanentShown = true;
                            item.shown = false;
                        }
                    });

                    setGridItems(tmpGrid);
                    setShowCount(0);
                } else {
                    let tmpGrid = [...gridItems];

                    setTimeout(() => {
                        tmpGrid.forEach(item => {
                            item.shown = false;
                        });
                        setGridItems(tmpGrid);
                        setShowCount(0);
                    }, 1000)
                }
                setMoveCount(moveCount => moveCount + 1)
            }
        }
    }, [showCount, gridItems]);


    // Verifica quando o jogo acaba

    useEffect(()=> {
        if(moveCount > 0 && gridItems.every(item => item.permanentShown === true)) {
            setPlaying(false);
        }
    }, [moveCount, gridItems])

    return (
        <C.Container>
            <C.Info>
                <C.LogoLink href="">
                    <img src={logoImage} width="200" alt="" />
                </C.LogoLink>

                <C.InfoArea>
                    <InfoItem label='Tempo' value={formatTimeElapsed(timeElapsed)} />
                    <InfoItem label='Movimentos' value={`${moveCount}`} />
                </C.InfoArea>

                <Button label='Reiniciar' icon={RestartIcon} onClick={resetAndCreateGrid} />
            </C.Info>

            <C.GridArea>
                <C.Grid>
                    {gridItems.map((item, index) => (
                        <GridItem
                            key={index}
                            item={item}
                            onClick={() => handleItemClick(index)} />
                    ))}
                </C.Grid>
            </C.GridArea>
        </C.Container>
    )
}


export default App;