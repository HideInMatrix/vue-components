import "./base.css"
export function CanvasTemplate () {
  return `
  <div class="board-wrapper">
    <div class="canvas-list swiper">
      <div class="swiper-wrapper"></div>
    </div>
    <div class="toolbar-wrapper">
      <button id="newPage" type="button" class="bsch-btn "> <img src="data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFiSURBVHgBpVRbToNAFB0o/Wj6Ia7AdAXWFRSX4AqsCY/w6QrKDvSHQAKJLKGuANxB3QHdAf0ghLdnElAcUcCeZHLvnbmcOXfmDhzpQFGUdV3XIvkDrusGffNc66iqasDsyACwkec4zgM7z38yctwG5jCbzaS+QQmavK0sywZLJDC7RZZlvZEeQLHUuM88z+9ARss0fiiagIhuSMlAfj+ZCB8fG9dAeWIzt23XBTISOGAPxmtjTdN8EJHJioZwDlHUDUaXxiJN00cY8V9EtPNx0C9Zlt16nhd216aWtqZjuVxesAujFLVvEL1zTW+qKIo1GnIlCEJo23Y4mgjwQSK21w27R0yqqtojvBtNlOf5zWKxuCrLUkJoYGzx/sIkSd7JL6WJkCx1JzryQ5S4wmGT+XwemKZ5/JbXOpD7iqQnDL+bABW0Xy6pT1UgDuI4PjECvv5HFLqub9gEHOwJz+NABvABRGaTEpeLT70AAAAASUVORK5CYII="></img> 新建一页</button>
      <button id="clearPage" type="button" class="bsch-btn"> <img src="data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGySURBVHgBzVK7bsJAEDzbAlFSpqRMARIWFKGDP4A/oOARUTlVypAuXZTOEQicL3BN5aRDQoDpoHNJSRpk3pl17iyHGESXrLS61+7szuwx9hemaVr81JvMLrRqtZpeLpdjrFbYu3IJSKVS0SRJ6mIbw3qdyWTiw+GwdzEQUUkmk7osy/c49jebTU5RlBg9qar6MRqNHBErsTNUUN3ENnE4HLRWq/VC9+VyOR6NRi3cJQCq6rrugcmnqGDxtEBCXoCQGYaxWK/XJdrv93szlFqQCrqZIiHX6XRmx4Vs215ks1m614ReSpDKdru1AJDH0YHHdrvdK5LcsK6RPCUQDjaRw6jAqfVEJBIx2RkNsRR9ao1GI41EE53MQaUAKhNMY44qn7i7DRu1+A5wF7lFaNhTBoMBJRH6DbR5IxDeej/QuoPzhDRMpVJPiHtg39+hIDT0xs9HOqY9ulJpMqJ6vV63MB36CkS/SZRxbrbb7cdgl55GlCh0AWA3GLBarUp8awgNj0H8joTVajWq+ozgdz9AkohemoPYWBbst939+EdCF2hwBQDG3YU73N3Ave+wGft39gWYEN7TS6T5DAAAAABJRU5ErkJggg=="></img> 清空当前页</button>
      <button id="deletePage" type="button" class="bsch-btn "> <img src="data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGISURBVHgBlZTNccIwEIVt4wtwwB1E6QA6cDpIOuDA39GpIEMH5MbAAacC0gEpgXTgdOBc+MfOex6JEVjGzs6IXUnP365XMrZVwYIg8Lbb7Ztt2+/T6TQyadwyyGg08jebzQKhSJKkDf9k0jn3IP1+f4KHV3I6QUV+r9cLTFq7oAqRpukCwyfgcDiMwzCMh8PhilUdj8dHzo0g9mG323kUEoLsjMeu64ZKczqdBNaXGF+O47zq/bqAmE1W8B/7nM1mLwz0ZkcAxcgWVCFAy55d5q62kb0zMnxUAfEgmFzNHQ0UsS/dbtdTa4PB4NkUU0Mtn8mBYL/8aTabLXreH7glMrf1mHuNRkOo5DlQrVbLFnHUwrq21m2M08yqRlWxqaJIbgqrxM7ns9Df4gqEOxTLcr0yEJI90M/n83UOxJsqj19IMEVr3OIfPZZyT52yMvcmE0GeAsN1tO2OphN6o02gNT8RfJi+dccAEXDFFXETsDbGyioxaCaFoP1+P67X66FVwfBH963P/wD1+8tKdNsuuAAAAABJRU5ErkJggg=="></img> 删除当前页</button>
      <ul class="bsch-pagination-list">
      </ul>
      <button id="savePage" type="button" class="bsch-btn primary-btn">保存</button>
    </div>
  </div>
  `
}
