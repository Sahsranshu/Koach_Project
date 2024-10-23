import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Components
import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { ControlsComponent } from './components/controls/controls.component';

// Services
import { GameService } from './services/game.service';
import { ModelService } from './services/model.service';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    DrawingComponent,
    ControlsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    GameService,
    ModelService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
