import { Component, OnInit } from '@angular/core';
import { Tile } from '../model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit{
  public tilesList: Tile[][] = []
  public currentMove: string = "O"
  public static width: number;
  public static height: number;
  public scores: {"X": number, "O": number} = {"X": 0, "O": 0}
  public class: string = ""

  private winChecks: {x:number, y:number}[] = [
    {x:1, y:0},
    {x:0, y:1},
    {x:1, y:1},
    {x:-1, y:1},
  ]
  ngOnInit(): void {
    BoardComponent.width = 18
    BoardComponent.height = 24

    this.tilesList = [...Array(BoardComponent.height)
          .fill("")
          .map((_i, i) => ([...Array(BoardComponent.width).fill("").map((_j, j) => ({status: "", x: j, y: i, scored: false}))]))]
  }

  click(x: number, y: number){
    if(this.tilesList[y][x].status != "") return
    this.tilesList[y][x].status = this.currentMove

    this.checkIfScored(x, y)
    this.doNewAIMove()
  }

  checkWeights(x: number, y: number, as: string){
    let maxPoints = 0

    for(let check of this.winChecks){
      let points = 0

      let startX = x - 4 * check.x
      let startY = y - 4 * check.y

      let currentX = startX
      let currentY = startY

      while(Math.abs(currentX - x) <= 4 && Math.abs(currentY - y) <= 4){
        if(currentX >= 0 && currentX < BoardComponent.width && currentY >= 0 && currentY < BoardComponent.height){
          if((this.tilesList[currentY][currentX].status === as && this.tilesList[currentY][currentX].scored === false) || (currentX == x && currentY == y)){
            points+=1;
          }else{
            if(maxPoints < points) {
              maxPoints = points
            }
            points = 0
          }
        }

        currentX += check.x
        currentY += check.y
      }
    }

    return as == "X" ? maxPoints * 2 + 1 : maxPoints * 2
  }

  doNewAIMove(){
    let maxWeight = 0;
    let newX = -1
    let newY = -1;

    let weights = this.tilesList.map((row: Tile[]) =>
      row.map((tile: Tile) => {
        if(tile.status != "") return {"O": 0, "X": 0};
        let {x, y} = tile
        return {O: this.checkWeights(x, y, "O"), X: this.checkWeights(x, y, "X")}
      })
    )

    console.log(weights)

    weights.forEach((row, y) => {
      row.forEach((weight, x) => {
        if(weight.X > maxWeight || weight.O > maxWeight){
          maxWeight = Math.max(weight.X, weight.O)
          newX = x
          newY = y
        }
      })
    })

    console.log(newX, newY)
    this.tilesList[newY][newX].status = "X"
    this.checkIfScored(newX, newY)
  }

  checkIfScored(x:number, y:number): boolean{
    let pointFor: string = this.tilesList[y][x].status

    for(let check of this.winChecks){
      let points = 0
      let startX = x - 4 * check.x
      let startY = y - 4 * check.y

      let currentX = startX
      let currentY = startY

      while(Math.abs(currentX - x) <= 4 && Math.abs(currentY - y) <= 4){
        if(currentX < 0 || currentX > BoardComponent.width - 1 || currentY < 0 || currentY > BoardComponent.height - 1){
        }else{
          if(this.tilesList[currentY][currentX].status === pointFor && this.tilesList[currentY][currentX].scored === false){
            points+=1;
          }else{
            points = 0
          }

          if(points == 5){
            pointFor == "X" ? this.scores.X += 1 : this.scores.O += 1

            let pointerX = currentX - 4 * check.x
            let pointerY = currentY - 4 * check.y

            for(let i=0; i<5; i++){
              this.tilesList[pointerY + i * check.y][pointerX + i * check.x].scored = true
            }
          }
        }
        currentX += check.x
        currentY += check.y
      }
    }

    return false
  }
}
